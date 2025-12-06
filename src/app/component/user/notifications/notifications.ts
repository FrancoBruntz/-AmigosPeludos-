import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/notificacionservice';
import { UserService } from '../user.service';
import Notificacion from '../../../models/notificacion';
import { Petsservice } from '../../../services/petsservice';
import Pets from '../../../models/pets';
import { effect } from '@angular/core';

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
  
  private petsService = inject(Petsservice);

 notificationsSignal =  this.notifService.notificaciones;

  notifications: Notificacion[] = [];
  petMap: Map<string, Pets> = new Map();
 
  loading = true;
  error = '';

  
 constructor() {
  effect(() => {
    this.notifications = this.notificationsSignal();
  });
}

  ngOnInit() {
    const dni = this.userService.getUser()?.dni;

    if (!dni) {
      this.error = 'Inicia sesión para ver notificaciones';
      this.loading = false;
      return;
    }

    // 1. Cargar mascotas
    this.petsService.getPet().subscribe({
      next: (pets: Pets[]) => {
        pets.forEach(p => this.petMap.set(p.id, p));

        // 2. Cargar notificaciones
        this.notifService.cargarPorUsuario(dni);

        // El efecto reactivo actualizará notifications
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar mascotas';
        this.loading = false;
      }
    });
  }

  getNombreAnimal(animalId: string): string {
    return this.petMap.get(animalId)?.name || `Animal #${animalId}`;
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
