import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Notificacion, { TipoNotificacion } from '../models/notificacion';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/notificaciones';


   // ✅ SIGNAL PRINCIPAL
  private _notificaciones = signal<Notificacion[]>([]);

  // ✅ SELECTORES
  notificaciones = this._notificaciones.asReadonly();

  unreadCount = computed(
    () => this._notificaciones().filter(n => !n.leida).length
  );

   private _message = signal<string | null>(null);

  /**
   * Devuelve el mensaje actual (para el template)
   */
  message() {
    return this._message();
  }

  /**
   * Muestra un mensaje por 3 segundos
   */
  show(text: string) {
    this._message.set(text);

    setTimeout(() => {
      this._message.set(null);
    }, 3000);
  }

  /**
   * Limpia el mensaje (por si querés ocultarlo manualmente)
   */
  clear() {
    this._message.set(null);
  }

  
  cargarPorUsuario(dni: string) {
      this.http
      .get<Notificacion[]>(`${this.base}?usuarioDNI=${encodeURIComponent(dni)}&_sort=-fechaCreacion`)
      .subscribe(n => this._notificaciones.set(n)); // ⭐ ACTUALIZA SIGNAL
  }
  
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
     return this.http.post<Notificacion>(this.base, body).pipe(
      tap((created) => {
        // preprend para mantener orden por fecha desc
        this._notificaciones.update(curr => [created, ...curr]);
      })
    );
  }

  // Obtener notificaciones de un usuario (por DNI)
  listByUser(dni: string) {
    return this.http.get<Notificacion[]>(
      `${this.base}?usuarioDNI=${encodeURIComponent(dni)}`
    );
  }

   /**
   * Marcar notificación como leída y actualizar signal (método seguro)
   */
  markAsReadAndUpdate(id: string): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.base}/${id}`, { leida: true }).pipe(
      tap((updated) => {
        this._notificaciones.update(arr => arr.map(n => n.id === id ? updated : n));
      })
    );
  }

  /**
   * Eliminar notificación y actualizar signal
   */
  deleteAndUpdate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => {
        this._notificaciones.update(arr => arr.filter(n => n.id !== id));
      })
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
