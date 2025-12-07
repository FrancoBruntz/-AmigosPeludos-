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
  markAsRead(notif: Notificacion)  {
    this.notifService.markAsReadAndUpdate(notif.id).subscribe({
      next: (updated) => {
        // el servicio ya actualizó la signal; si querés que el array local se actualice inmediatamente:
        this.notifications = this.notifications.map(n => n.id === updated.id ? updated : n);
      },
      error: (e) => alert('Error al marcar como leída')
    });
  }


  deleteNotification(notif: Notificacion)  {
    this.notifService.deleteAndUpdate(notif.id).subscribe({
      next: () => {
        // la signal ya fue actualizada por el servicio, pero para mantener consistencia:
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
      },
      error: (e) => alert('Error al eliminar notificación')
    });
  }

  clearAllNotifications() {
    // Método seguro que borra todas en cadena y actualiza la signal una a una.
    const ids = [...this.notifications].map(n => n.id);
    // Elijo secuencial para no saturar el servidor; cada deleteAndUpdate actualizará la signal
    ids.forEach(id => {
      this.notifService.deleteAndUpdate(id).subscribe({
        error: () => { /* opcional: log */ }
      });
    });
    // Opcionalmente vaciamos la vista inmediatamente (el servicio también la actualizará)
    this.notifications = [];
  }
}
