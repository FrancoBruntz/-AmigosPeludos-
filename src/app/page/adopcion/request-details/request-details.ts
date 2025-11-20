import { Component, OnInit } from '@angular/core';
import Solicitud from '../../../models/solicitud';
import { DatePipe } from '@angular/common';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';
import { FormsModule } from '@angular/forms';
import { Petsservice } from '../../../services/petsservice';

@Component({
  selector: 'app-request-details',
  imports: [DatePipe, FormsModule],
  templateUrl: './request-details.html',
  styleUrl: './request-details.css',
})
export class RequestDetails implements OnInit {
  
  solicitud ?: Solicitud;
  isLoading = true;
  errorMessage = '';

  // 🔹 Estado para el modal de aprobar/rechazar
  showComentariosModal = false;
  comentariosText = '';
  // 'aprobar' | 'rechazar' → acción actual del modal
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
        this.solicitud= data;
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

  // Helpers para mostrar Sí/No
  boolToText(value: boolean | undefined): string {
    return value ? 'Sí' : 'No';
  }

  viviendaLabel(tipo: 'casa' | 'departamento'): string {
    return tipo === 'casa' ? 'Casa' : 'Departamento';
  }

   // 🔹 Abrir modal con la acción seleccionada
  openModal(accion: 'aprobar' | 'rechazar'): void {
    this.modalAccion = accion;
    this.showComentariosModal = true;
  }

  // 🔹 Cerrar modal y limpiar comentarios
  closeModal(): void {
    this.showComentariosModal = false;
    this.comentariosText = '';
  }

  // 🔹 Confirmar acción (aprobar / rechazar)
confirmarAccion(): void {
  if (!this.solicitud) return;

  const nuevoEstado =
    this.modalAccion === 'aprobar' ? 'aprobada' : 'rechazada';

  // 🔹 Primero cambiamos el estado de la solicitud
  this.solicitudesServ
    .cambiarEstado(this.solicitud.id, nuevoEstado, this.comentariosText)
    .subscribe({
      next: (dataActualizada) => {
        // ⬅Acá YA se actualiza el estado de la solicitud
        this.solicitud = dataActualizada;

        // Si se aprobó, también marcamos el pet como inactivo
        if (nuevoEstado === 'aprobada' && this.solicitud?.animalId) {
          const petId = String(this.solicitud.animalId);

          this.petsServ.cambiarActivoPet(petId, false).subscribe({
            next: () => {
              alert('Solicitud aprobada y mascota marcada como no disponible.');
              this.closeModal();
            },
            error: () => {
              alert('La solicitud se aprobó, pero hubo un error al actualizar la mascota.');
              this.closeModal();
            }
          });

        } else {
          // Si se rechazó, solo avisamos
          alert(
            `Solicitud ${this.modalAccion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente.`
          );
          this.closeModal();
        }
      },
      error: () => {
        alert('Ocurrió un error al actualizar la solicitud.');
      }
    });
}

}
