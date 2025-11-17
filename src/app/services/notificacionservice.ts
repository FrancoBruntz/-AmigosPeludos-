import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Notificacion, { TipoNotificacion } from '../models/notificacion';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/notificaciones';

  // Enviar notificación (cuando admin aprueba/rechaza)
  send(usuarioDNI: string, solicitudId: string, animalId: string, tipo: TipoNotificacion, mensaje: string, comentarios?: string) {
    const body: Omit<Notificacion, 'id'> = {
      usuarioDNI,
      solicitudId,
      animalId,
      tipo,
      mensaje,
      comentarios,
      leida: false,
      fechaCreacion: new Date().toISOString()
    };
    return this.http.post<Notificacion>(this.base, body as any);
  }

  // Obtener notificaciones de un usuario (por DNI)
  listByUser(dni: string) {
    return this.http.get<Notificacion[]>(
      `${this.base}?usuarioDNI=${encodeURIComponent(dni)}`
    );
  }

  // Marcar notificación como leída
  markAsRead(id: string) {
    return this.http.patch<Notificacion>(`${this.base}/${id}`, { leida: true });
  }

  // Eliminar notificación
  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  // Obtener todas las notificaciones de un usuario y ordenarlas por fecha desc
  listByUserSorted(dni: string) {
    return this.http.get<Notificacion[]>(
      `${this.base}?usuarioDNI=${encodeURIComponent(dni)}&_sort=-fechaCreacion`
    );
  }
}
