import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/notificacionservice';
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
    private userService: UserService,
    private notif: NotificacionService
  ) {}

  ngOnInit() {
    const userFromService = this.userService.getUser();

    const localUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('amigospeludos_user') || 'null');
      } catch {
        return null;
      }
    })();

    const user = userFromService ?? localUser;

    this.form = this.fb.group({
      dni: [user?.dni || user?.user || '', Validators.required],
      nombre: [user?.nombre || '', Validators.required],
      apellido: [user?.apellido || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      telefono: [
        user?.telefono || '',
        [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]
      ],
      direccion: [user?.direccion || '', Validators.required]
    });

    const lookup = user?.dni ?? user?.user ?? null;

    if (lookup) {
      this.userService.getByDni(String(lookup)).subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            const perfil = users[0];

            this.userService.saveCurrent(perfil as any);

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
        error: () => {
          this.notif.mostrarSnackbar(
            'No se pudo sincronizar el perfil.',
            'error'
          );
        }
      });
    }
  }

  guardarCambios() {
    if (this.form.invalid) {
      this.notif.mostrarSnackbar('Completá todos los campos correctamente', 'error');
      return;
    }

    const updated = this.form.value;
    const user = this.userService.getUser();

    if (!user || !user.id) {
      this.notif.mostrarSnackbar('No se pudo actualizar: falta el ID del usuario', 'error');
      return;
    }

    updated.user = updated.dni;

    this.userService.updateUserOnServer(user.id, updated).subscribe({
      next: () => {
        this.userService.updateProfile(updated);
        this.notif.mostrarSnackbar('Datos guardados con éxito', 'exito');
      },
      error: () => {
        this.notif.mostrarSnackbar('Error al guardar en el servidor', 'error');
      }
    });
  }

  logout() {
    this.userService.logout();
  }

  user() {
    return this.userService.getUser();
  }
}


