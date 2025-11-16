import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import Solicitud, {EstadoSolicitud} from '../../../models/solicitud';

@Component({
  selector: 'app-admin-request',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-request.html',
  styleUrl: './admin-request.css',
})
export class AdminRequest {

  // El mismo servicio que se usa en adoptante, lo reutilizo para admin
  private svc = inject(Solicitudesservice);

  // Estados de la vista
  loading = true;
  error = '';
  data: Solicitud[] = []; // listado actual q mostramos

  // Controles de filtro en la UI
  dni = '';
  estado: '' | EstadoSolicitud = '';

  // Al montas el componente , disparamos la busqueda inicial
  ngOnInit() {
    this.buscar();
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
    this.cambiar(s, 'aprobada');
  }

  rechazar(s: Solicitud) {
    this.cambiar(s, 'rechazada');
  }

  private cambiar (s: Solicitud, estado: EstadoSolicitud){
    this.svc.cambiarEstado(s.id, estado).subscribe({
      next: () => {
        s.estado = estado;
      },
      error: e => alert('No se pudo actualizar: ' + e)

    });
  }

  // trackById para que Angular reutilice filas de tabla cuando se posible
  trackById = (_: number, s: Solicitud) => s.id;

}
