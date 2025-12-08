import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    // Obtener user desde servicio o localStorage
    const userFromService = this.userService.getUser();
    const localUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('amigospeludos_user') || 'null');
      } catch {
        return null;
      }
    })();

    const user = userFromService ?? localUser;

    // Inicializar formulario con lo que haya disponible
    this.form = this.fb.group({
      dni: [user?.dni || user?.user || '', Validators.required],
      nombre: [user?.nombre || '', Validators.required],
      apellido: [user?.apellido || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      telefono: [user?.telefono || '', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      direccion: [user?.direccion || '', Validators.required]
    });

    // Intentar sincronizar con backend por DNI (o por 'user' si no hay 'dni')
    const lookup = user?.dni ?? user?.user ?? null;
    if (lookup) {
      this.userService.getByDni(String(lookup)).subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            const perfil = users[0];
            // Guardar en UserService (actualiza localStorage + signal)
            this.userService.saveCurrent(perfil as any);
            // Parchear el form con datos obtenidos del backend
            this.form.patchValue({
              dni: perfil.dni ?? perfil.user ?? '',
              nombre: perfil.nombre ?? '',
              apellido: perfil.apellido ?? '',
              email: perfil.email ?? '',
              telefono: perfil.telefono ?? '',
              direccion: perfil.direccion ?? ''
            });
          }
        },
        error: (err) => {
          console.warn('No se pudo sincronizar perfil desde backend', err);
        }
      });
    }
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
