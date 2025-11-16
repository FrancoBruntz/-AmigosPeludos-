import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/notificacionservice';
import { UserService } from '../user.service';
import Notificacion from '../../../models/notificacion';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NotificationsComponent implements OnInit {
  
  private notifService = inject(NotificacionService);
  private userService = inject(UserService);

  notifications: Notificacion[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    const dni = this.userService.getUser()?.dni;
    
    if (!dni) {
      this.error = 'Inicia sesión para ver notificaciones';
      this.loading = false;
      return;
    }

    this.notifService.listByUserSorted(dni).subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.loading = false;
      },
      error: (e) => {
        this.error = 'No se pudo cargar las notificaciones';
        this.loading = false;
      }
    });
  }

  markAsRead(notif: Notificacion) {
    this.notifService.markAsRead(notif.id).subscribe({
      next: () => {
        notif.leida = true;
      },
      error: (e) => alert('Error al marcar como leída')
    });
  }

  deleteNotification(notif: Notificacion) {
    this.notifService.delete(notif.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
      },
      error: (e) => alert('Error al eliminar notificación')
    });
  }

  clearAllNotifications() {
    this.notifications.forEach(n => {
      this.notifService.delete(n.id).subscribe();
    });
    this.notifications = [];
  }
}
