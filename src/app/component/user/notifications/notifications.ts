import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/notificacionservice';
import { UserService } from '../user.service';
import Notificacion from '../../../models/notificacion';
import { Petsservice } from '../../../services/petsservice';
import Pets from '../../../models/pets';

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

  notifications: Notificacion[] = [];
  loading = true;
  error = '';

  petMap: Map<string, Pets> = new Map();

  // Nuevo para que se vea el nombre de la mascota en la notificación

  ngOnInit() {
  this.cargarDatos();
  }

  private cargarDatos() {

    const dni = this.userService.getUser()?.dni;

    if (!dni) {
      this.error = 'Inicia sesión para ver notificaciones';
      this.loading = false;
      return;
    }

    // Traigo los pets y armo el mapa
    this.petsService.getPet().subscribe({

    next: (pets) => {
      pets.forEach(p => this.petMap.set(p.id, p));

      //Una vez que tengo el mapa, cargo las notificaciones
      this.notifService.listByUserSorted(dni).subscribe({
        next: (notifs) => {
          this.notifications = notifs;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar las notificaciones';
          this.loading = false;
        }
      });
    },

    error: () => {
      // Si fallan los pets, igual intento traer notificaciones
      this.notifService.listByUserSorted(dni).subscribe({
        next: (notifs) => {
          this.notifications = notifs;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar las notificaciones';
          this.loading = false;
        }
      });
    }
  });
}

// helper para obtener el nombre de la mascota por su ID
getNombreAnimal(animalId: string): string {
  return this.petMap.get(animalId)?.name || `Animal #${animalId}`;
}

/*  ngOnInit() {
    this.cargarNotificaciones();
  }*/

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
