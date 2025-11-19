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

  tipoAnimal: '' | 'perro' | 'gato' = '';

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
buscar() {
  this.loading = true;

  const dniParam = this.dni.trim() || undefined;
  const estadoParam = this.estado || undefined;

  this.svc.list({ dni: dniParam, estado: estadoParam }).subscribe({
    next: (r) => {
      // Empezamos del resultado crudo del backend
      let resultado = r;

      // Si hay tipo seleccionado (perro / gato), filtramos en base a petMap
      if (this.tipoAnimal) {
        resultado = r.filter((s) => {
          const pet = this.petMap.get(s.animalId);
          if (!pet || !pet.type) return false;

          // Normalizamos todo a minúsculas por las dudas
          return pet.type.toLowerCase() === this.tipoAnimal.toLowerCase();
        });
      }

      //ordenar sobre "resultado"
      this.data = resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
      this.loading = false;
    },
    error: (_) => {
      this.error = 'No se pudo cargar';
      this.loading = false;
    },
  });
}

  // Limpia filtros y vuelve a buscar
  limpiar ( ) {
    this.dni = '';
    this.estado = '';
    this.tipoAnimal = '';
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
        const pet = this.petMap.get(s.animalId);

        if (estado === 'aprobada' && pet) {
          pet.activo = false;
          this.petsService.updatePet(pet).subscribe({
            error: e => console.error('Error al marcar animal como inactivo:', e)
          });
        }

      // Enviar notificación al adoptante usando el nombre del animal
      const nombreAnimal = pet?.name || `animal #${s.animalId}`;
        
      // Enviar notificación al adoptante
      const mensaje = estado === 'aprobada' 
        ? `¡Felicidades! Tu solicitud para ${nombreAnimal} fue aprobada. El refugio se pondrá en contacto.`
        : `Lamentablemente, tu solicitud para ${nombreAnimal} fue rechazada.`;
        
        this.notifService.send(
          s.solicitanteUser,  // id del adoptante 
          s.id,
          s.animalId,
          estado as any,
          mensaje,  // mensaje ya armado con nombre 
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
