import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { NotificacionService } from '../../../services/notificacionservice';
import { Petsservice } from '../../../services/petsservice';
import Solicitud, {EstadoSolicitud} from '../../../models/solicitud';
import Pets from '../../../models/pets';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-request',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterLink],
  templateUrl: './admin-request.html',
  styleUrl: './admin-request.css',
})
export class AdminRequest {

  // Servicios
  private svc = inject(Solicitudesservice);
  private notifService = inject(NotificacionService);
  private petsService = inject(Petsservice);

  // Estados de la vista
  loading = true;
  error = '';
  data: Solicitud[] = []; // listado actual q mostramos
  petMap: Map<string, Pets> = new Map(); // para mapear animalId -> nombre

  // Controles de filtro en la UI
  dni = '';
  estado: '' | EstadoSolicitud = '';

  // Para modal de comentarios
  showComentariosModal = false;
  selectedSolicitud: Solicitud | null = null;
  comentariosText = '';
  modalAccion: 'aprobar' | 'rechazar' | null = null;

  // Al montas el componente , disparamos la busqueda inicial
  ngOnInit() {
    // Cargar primero los pets para tener el mapeo disponible
    this.petsService.getPet().subscribe({
      next: (pets) => {
        pets.forEach(pet => this.petMap.set(pet.id, pet));
        this.buscar();
      },
      error: () => this.buscar() // Continuar aunque falle
    });
  }

  // Hace la busqueda contra el backend con los filtros actuales
  buscar () {
    this.loading = true;

    // si el dni esta vacio o solo espacios, enviamos undefined para no filtrar por eso
    const dniParam = this.dni.trim() || undefined;
    const estadoParam = this.estado || undefined;

    this.svc.list( {dni: dniParam, estado: estadoParam}).subscribe({
      
      // ok: guardamos el resultado, y ordenamos por fecha desc para ver lo ultimo arriba
      next: r => {
        this.data = r.sort((a , b) => b.fecha.localeCompare(a.fecha));
        this.loading = false;
      },

      // error: mensaje + apagamos loading
      error: _ => {
        this.error = 'No se pudo cargar';
        this.loading = false;
      }

    });
  }

  // Limpia filtros y vuelve a buscar
  limpiar ( ) {
    this.dni = '';
    this.estado = '';
    this.buscar();
  }

  // Acciones de moderacion: cambian el estado de una solicitud a "aprobada" o "rechazada"
  aprobar (s: Solicitud) {
    this.modalAccion = 'aprobar';
    this.selectedSolicitud = s;
    this.comentariosText = '';
    this.showComentariosModal = true;
  }

  rechazar(s: Solicitud) {
    this.modalAccion = 'rechazar';
    this.selectedSolicitud = s;
    this.comentariosText = '';
    this.showComentariosModal = true;
  }

  // Cerrar modal
  closeModal() {
    this.showComentariosModal = false;
    this.selectedSolicitud = null;
    this.comentariosText = '';
    this.modalAccion = null;
  }

  // Confirmar acción (aprobar/rechazar) con comentarios
  confirmarAccion() {
    if (!this.selectedSolicitud || !this.modalAccion) return;
    
    const estado: EstadoSolicitud = this.modalAccion === 'aprobar' ? 'aprobada' : 'rechazada';
    this.cambiar(this.selectedSolicitud, estado, this.comentariosText);
    this.closeModal();
  }

  // Método auxiliar para obtener nombre del animal
  getNombreAnimal(animalId: string): string {
    return this.petMap.get(animalId)?.name || `Animal #${animalId}`;
  }

  private cambiar (s: Solicitud, estado: EstadoSolicitud, comentarios?: string){
    this.svc.cambiarEstado(s.id, estado, comentarios).subscribe({
      next: () => {
        s.estado = estado;
        if (comentarios) s.comentarios = comentarios;
        
        // Si se aprueba, marcar el animal como inactivo (adoptado)
        if (estado === 'aprobada') {
          const pet = this.petMap.get(s.animalId);
          if (pet) {
            pet.activo = false;
            this.petsService.updatePet(pet).subscribe({
              error: e => console.error('Error al marcar animal como inactivo:', e)
            });
          }
        }
        
        // Enviar notificación al adoptante
        const mensaje = estado === 'aprobada' 
          ? '¡Felicidades! Tu solicitud fue aprobada. El refugio se pondrá en contacto.'
          : 'Lamentablemente, tu solicitud fue rechazada.';
        
        this.notifService.send(
          s.solicitanteUser,
          s.id,
          s.animalId,
          estado as any,
          mensaje,
          comentarios
        ).subscribe({
          error: e => console.error('Error al enviar notificación:', e)
        });
      },
      error: e => alert('No se pudo actualizar: ' + e)

    });
  }

  // trackById para que Angular reutilice filas de tabla cuando se posible
  trackById = (_: number, s: Solicitud) => s.id;

}
