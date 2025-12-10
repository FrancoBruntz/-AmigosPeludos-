import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { NotificacionService } from '../../../services/notificacionservice';
import { AuthService } from '../../../auth/auth-service';
import { UserService } from '../../../component/user/user.service';
import { CommonModule } from '@angular/common';
import { TipoVivienda } from '../../../models/solicitud';
import { Petsservice } from '../../../services/petsservice';
import Pets from '../../../models/pets';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css',
})
export class RequestForm {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudes = inject(Solicitudesservice);
  private notifService = inject(NotificacionService);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private petsService = inject(Petsservice);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  form = this.fb.group({
    tipoVivienda: ['', Validators.required],
    tienePatio: [false],
    tieneMascotas: [false],
    detalleMascotas: [''],
    viveConNinos: [false],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
    aceptaCompromiso: [false, Validators.requiredTrue]
  });

  private perfilIncompleto(): boolean {
    const user = this.userService.getUser();
    if (!user) return true;

    const campos = [
      user.nombre,
      user.apellido,
      user.email,
      user.telefono,
      user.direccion
    ];

    return campos.some(campo => !campo || campo.toString().trim() === '');
  }

  get animalId(): string {
    return String(this.route.snapshot.paramMap.get('animalId'));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = this.userService.getUser();
    const dni = currentUser?.dni ?? currentUser?.user ?? null;

    if (!dni) {
      this.snack.open('Debes iniciar sesión', 'Cerrar', { duration: 3000 });
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.perfilIncompleto()) {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: { mensaje: 'Tu perfil está incompleto. ¿Querés completarlo ahora?' }
      });

      ref.afterClosed().subscribe(res => {
        if (res) this.router.navigateByUrl('/user/profile');
      });

      return;
    }

    this.solicitudes.fetchUserRequestForAnimal(this.animalId, dni).subscribe({
      next: (list) => {
        const yaPendiente = list.some(s => s.estado === 'pendiente');

        if (yaPendiente) {
          this.snack.open('Ya tenés una solicitud pendiente para este animal', 'Cerrar', { duration: 3500 });
          return;
        }

        const value = this.form.value;

        const mensaje: string | undefined = value.mensaje || undefined;

        const extraDatos = {
          tipoVivienda: value.tipoVivienda as TipoVivienda,
          tienePatio: !!value.tienePatio,
          tieneMascotas: !!value.tieneMascotas,
          detalleMascotas: value.detalleMascotas || undefined,
          viveConNinos: !!value.viveConNinos,
          aceptaCompromiso: !!value.aceptaCompromiso
        };

        this.solicitudes.create(
          this.animalId,
          dni,
          mensaje,
          extraDatos
        ).subscribe({
          next: (created) => {

            this.petsService.getPet().subscribe({
              next: (pets: Pets[]) => {
                const pet = pets.find(p => p.id === this.animalId);
                const nombreAnimal = pet?.name || `animal #${this.animalId}`;
                const adminMsg = `Nueva solicitud de ${dni} para ${nombreAnimal}`;

                this.notifService.send('admin', created.id, this.animalId, 'comentario' as any, adminMsg).subscribe();
              },
              error: () => {
                const adminMsg = `Nueva solicitud de ${dni} para animal #${this.animalId}`;
                this.notifService.send('admin', created.id, this.animalId, 'comentario' as any, adminMsg).subscribe();
              }
            });

            this.snack.open('Solicitud enviada con éxito', 'OK', { duration: 3000 });
            this.router.navigateByUrl('/mis-solicitudes');
          },
          error: () => {
            this.snack.open('Error al enviar la solicitud', 'Cerrar', { duration: 3500 });
          }
        });
      },
      error: () => {
        this.snack.open('No se pudo validar solicitudes previas', 'Cerrar', { duration: 3500 });
      }
    });
  }
}
