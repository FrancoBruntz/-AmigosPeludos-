import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ProfileComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    const user = this.userService.getUser();

    this.form = this.fb.group({
      dni: [user?.dni || ''],
      nombre: [user?.nombre || ''],
      apellido: [user?.apellido || ''],
      email: [user?.email || ''],
      telefono: [user?.telefono || ''],
      direccion: [user?.direccion || '']
    });
  }

guardarCambios() {
  if (this.form.invalid) return;

  const updated = this.form.value;
  const user = this.userService.getUser();

  if (!user || !user.id) {
    alert("No se pudo actualizar: falta el ID del usuario");
    return;
  }

  // mantener user = dni para login
  updated.user = updated.dni;

  // 1) Actualizar JSON
  this.userService.updateUserOnServer(user.id, updated).subscribe({
    next: () => {
      // 2) Actualizar en memoria
      this.userService.updateProfile(updated);
      alert("Datos guardados con éxito");
    },
    error: () => alert("Error al guardar en el servidor")
  });
}


  logout() {
    this.userService.logout();
  }

  user() {
    return this.userService.getUser();
  }
}
