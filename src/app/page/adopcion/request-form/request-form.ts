import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { NotificacionService } from '../../../services/notificacionservice';
import { AuthService } from '../../../auth/auth-service';
import { UserService } from '../../../component/user/user.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  // Form sencillo: solo mensaje (valida intencion real)
  form = this.fb.group({
    mensaje: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Tomamos :animalId desde la URL 
  get animalId(): string {
    return String(this.route.snapshot.paramMap.get('animalId'));
  }

  submit() {

    // Validacion del formulario
    if(this.form.invalid) { return; }

    // Verifico usuario logueado
    //const username = this.auth.getCurrentUsername();
    const dni = this.userService.getUser()?.dni ?? null;

    if(!dni) {
      alert('Debes iniciar sesion!');
      this.router.navigateByUrl('/login');
      return;
    }

    // Evitar duplicadas "pendientes" del mismo usuario para el mismo animal
    this.solicitudes.fetchUserRequestForAnimal(this.animalId, dni).subscribe({
      next: (list) => {
        const yaPendiente = list.some(s => s.estado === 'pendiente');
        if (yaPendiente){
          alert('Ya tenes una solicitud pendiente para este animal.');
          return;
        }

        // Crear la solicitud (POST). fecha/estado los setea el servicio
        const mensaje: string | undefined = this.form.value.mensaje || undefined;
        this.solicitudes.create(this.animalId, dni, mensaje).subscribe({
          next: (created) => {
            // Crear notificación para admin(s)
            const adminMsg = `Nueva solicitud de ${dni} para animal #${this.animalId}`;
            // En json-server no hay lógica para múltiples admins; creamos una notificación dirigida a 'admin'
            this.notifService.send('admin', created.id, this.animalId, 'comentario' as any, adminMsg).subscribe({
              error: () => console.warn('No se pudo notificar al admin')
            });

            alert('Solicitud enviada.');
            this.router.navigateByUrl('/mis-solicitudes');
          },
          error: (e) => alert ('Error al enviar la solicitud: ' +  e)
        });
      },
      error: (e) => alert ('No se pudo validar solicitudes previas: ' + e)

    });

  }

}
