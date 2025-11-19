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

  // ===== Formulario de solicitud de adopción =====
  form = this.fb.group({
    tipoVivienda: ['', Validators.required],          // casa / depto
    tienePatio: [false],                              // checkbox
    tieneMascotas: [false],                           // checkbox
    detalleMascotas: [''],                            // opcional
    viveConNinos: [false],                            // checkbox
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
    aceptaCompromiso: [false, Validators.requiredTrue] // compromiso refugio
  });

  // Tomamos :animalId desde la URL 
  get animalId(): string {
    return String(this.route.snapshot.paramMap.get('animalId'));
  }

  submit() {
    // Validación del formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Verifico usuario logueado
    const dni = this.userService.getUser()?.dni ?? null;

    if (!dni) {
      alert('Debes iniciar sesion!');
      this.router.navigateByUrl('/login');
      return;
    }

    // Evitar duplicadas "pendientes" del mismo usuario para el mismo animal
    this.solicitudes.fetchUserRequestForAnimal(this.animalId, dni).subscribe({
      next: (list) => {
        const yaPendiente = list.some(s => s.estado === 'pendiente');
        if (yaPendiente) {
          alert('Ya tenes una solicitud pendiente para este animal.');
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

            // Traemos los pets para obtener el nombre del animal
            this.petsService.getPet().subscribe({
              next: (pets: Pets[]) => {
                const pet = pets.find(p => p.id === this.animalId);
                const nombreAnimal = pet?.name || `animal #${this.animalId}`;

                const adminMsg = `Nueva solicitud de ${dni} para ${nombreAnimal}`;

                this.notifService
                  .send('admin', created.id, this.animalId, 'comentario' as any, adminMsg)
                  .subscribe({
                    error: () => console.warn('No se pudo notificar al admin')
                  });
              },
              
              error: () => {
                // Si falla cargar los pets, al menos mandamos algo con el id
                const adminMsg = `Nueva solicitud de ${dni} para animal #${this.animalId}`;
                this.notifService
                  .send('admin', created.id, this.animalId, 'comentario' as any, adminMsg)
                  .subscribe({
                    error: () => console.warn('No se pudo notificar al admin')
                  });
              }
            });

            alert('Solicitud enviada.');
            this.router.navigateByUrl('/mis-solicitudes');
           },
          error: (e) => alert('Error al enviar la solicitud: ' + e)
        });
      },
      error: (e) => alert('No se pudo validar solicitudes previas: ' + e)
    });
  }

}
