import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Notificacion, { TipoNotificacion } from '../models/notificacion';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/notificaciones';

  private dialog = inject(MatDialog);

  // SIGNAL PRINCIPAL
  private _notificaciones = signal<Notificacion[]>([]);

  // SELECTORES
  notificaciones = this._notificaciones.asReadonly();

  unreadCount = computed(
    () => this._notificaciones().filter(n => !n.leida).length
  );

  private _message = signal<string | null>(null);

  private channel?: BroadcastChannel;

  constructor(private snackBar: MatSnackBar) {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('amigospeludos_notifs');
        this.channel.onmessage = (ev) => {
          const created = ev.data as Notificacion;
          this._notificaciones.update(curr => [created, ...curr]);
        };
      }
    } catch {}

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === 'amigospeludos_new_notif' && e.newValue) {
          try {
            const created = JSON.parse(e.newValue) as Notificacion;
            this._notificaciones.update(curr => [created, ...curr]);
          } catch {}
        }
      });
    }
  }

  message() {
    return this._message();
  }

  show(text: string) {
    this._message.set(text);

    this.snackBar.open(text, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });

    setTimeout(() => {
      this._message.set(null);
    }, 3000);
  }

  clear() {
    this._message.set(null);
  }

  cargarPorUsuario(dni: string) {
    this.http
      .get<Notificacion[]>(`${this.base}?usuarioDNI=${encodeURIComponent(dni)}&_sort=-fechaCreacion`)
      .subscribe(n => this._notificaciones.set(n));
  }
  
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
        this._notificaciones.update(curr => [created, ...curr]);

        try {
          if (typeof BroadcastChannel !== 'undefined') {
            if (!this.channel) {
              this.channel = new BroadcastChannel('amigospeludos_notifs');
            }
            this.channel.postMessage(created);
          } else if (typeof window !== 'undefined') {
            localStorage.setItem('amigospeludos_new_notif', JSON.stringify(created));
            setTimeout(() => localStorage.removeItem('amigospeludos_new_notif'), 500);
          }
        } catch (e) {
          console.warn('Error propagando notificación entre pestañas', e);
        }
      })
    );
  }

  listByUser(dni: string) {
    return this.http.get<Notificacion[]>(
      `${this.base}?usuarioDNI=${encodeURIComponent(dni)}`
    );
  }

  markAsReadAndUpdate(id: string): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.base}/${id}`, { leida: true }).pipe(
      tap((updated) => {
        this._notificaciones.update(arr => arr.map(n => n.id === id ? updated : n));
      })
    );
  }

  deleteAndUpdate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => {
        this._notificaciones.update(arr => arr.filter(n => n.id !== id));
      })
    );
  }

  markAsRead(id: string) {
    return this.http.patch<Notificacion>(`${this.base}/${id}`, { leida: true });
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  listByUserSorted(dni: string) {
    return this.http.get<Notificacion[]>(
      `${this.base}?usuarioDNI=${encodeURIComponent(dni)}&_sort=-fechaCreacion`
    );
  }

  mostrarSnackbar(mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info') {
    let panelClass = '';

    switch (tipo) {
      case 'exito':
        panelClass = 'snackbar-exito';
        break;
      case 'error':
        panelClass = 'snackbar-error';
        break;
      default:
        panelClass = 'snackbar-info';
    }

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  // CONFIRM CON CANCELAR / ACEPTAR
  confirmar(mensaje: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      disableClose: true,
      data: { mensaje }
    });

    return new Promise(resolve => {
      dialogRef.afterClosed().subscribe(result => {
        resolve(!!result);
      });
    });
  }
}
