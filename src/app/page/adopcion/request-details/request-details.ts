import { Component, OnInit, inject } from '@angular/core';
import Solicitud from '../../../models/solicitud';
import { DatePipe } from '@angular/common';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { FormsModule } from '@angular/forms';
import { Petsservice } from '../../../services/petsservice';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-request-details',
  imports: [DatePipe, FormsModule],
  templateUrl: './request-details.html',
  styleUrl: './request-details.css',
})
export class RequestDetails implements OnInit {

  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  solicitud?: Solicitud;
  isLoading = true;
  errorMessage = '';

  showComentariosModal = false;
  comentariosText = '';
  modalAccion: 'aprobar' | 'rechazar' = 'aprobar';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudesServ: Solicitudesservice,
    private petsServ: Petsservice,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'No se encontró el identificador de la solicitud.';
      this.isLoading = false;
      return;
    }

    this.solicitudesServ.getById(id).subscribe({
      next: (data) => {
        this.solicitud = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se encontró la solicitud.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    if (this.auth.isAdmin()) {
      this.router.navigate(['/admin/solicitudes']);
    } else {
      this.router.navigate(['/mis-solicitudes']);
    }
  }

  boolToText(value: boolean | undefined): string {
    return value ? 'Sí' : 'No';
  }

  viviendaLabel(tipo: 'casa' | 'departamento'): string {
    return tipo === 'casa' ? 'Casa' : 'Departamento';
  }

  openModal(accion: 'aprobar' | 'rechazar'): void {
    this.modalAccion = accion;
    this.showComentariosModal = true;
  }

  closeModal(): void {
    this.showComentariosModal = false;
    this.comentariosText = '';
  }

  confirmarAccion(): void {
    if (!this.solicitud) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        mensaje:
          this.modalAccion === 'aprobar'
            ? '¿Confirmás la aprobación de esta solicitud?'
            : '¿Confirmás el rechazo de esta solicitud?'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      const nuevoEstado =
        this.modalAccion === 'aprobar' ? 'aprobada' : 'rechazada';

      this.solicitudesServ
        .cambiarEstado(this.solicitud!.id, nuevoEstado, this.comentariosText)
        .subscribe({
          next: (dataActualizada) => {
            this.solicitud = dataActualizada;

            if (nuevoEstado === 'aprobada' && this.solicitud?.animalId) {
              const petId = String(this.solicitud.animalId);

              this.petsServ.cambiarActivoPet(petId, false).subscribe({
                next: () => {
                  this.snack.open(
                    'Solicitud aprobada y mascota marcada como no disponible',
                    'OK',
                    { duration: 3500 }
                  );
                  this.closeModal();
                },
                error: () => {
                  this.snack.open(
                    'Solicitud aprobada, pero falló la actualización de la mascota',
                    'Cerrar',
                    { duration: 3500 }
                  );
                  this.closeModal();
                }
              });
            } else {
              this.snack.open(
                `Solicitud rechazada correctamente`,
                'OK',
                { duration: 3000 }
              );
              this.closeModal();
            }
          },
          error: () => {
            this.snack.open(
              'Ocurrió un error al actualizar la solicitud',
              'Cerrar',
              { duration: 3500 }
            );
          }
        });
    });
  }

}
