import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
  standalone: true,         // Asegúrate de que sea un standalone component
  imports: [CommonModule]   // Para que funcione *ngIf y *ngFor
})
export class NotificationsComponent {
  // ✅ Aquí definimos la propiedad notifications
  notifications: { id: number; text: string; read: boolean }[] = [
    { id: 1, text: 'Nueva notificación', read: false },
    { id: 2, text: 'Recordatorio', read: true },
    { id: 3, text: 'Evento importante', read: false }
  ];

  markAsRead(notification: { read: boolean }) {
    notification.read = true;
  }

  clearNotifications() {
    this.notifications = [];
  }
}

