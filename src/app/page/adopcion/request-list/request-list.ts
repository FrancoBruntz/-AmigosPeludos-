import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { Petsservice } from '../../../services/petsservice';
import Solicitud from '../../../models/solicitud';
import Pets from '../../../models/pets';
import { UserService } from '../../../component/user/user.service';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css',
})
export class RequestList implements OnInit {
  private solicitudes = inject(Solicitudesservice);
  private petsService = inject(Petsservice);
  private userService = inject(UserService);
  
  // Estado de la vista
  loading = true;
  error = '';
  data: Solicitud[] = [];
  petMap: Map<string, Pets> = new Map(); // para mapear animalId -> datos del animal

  ngOnInit(): void {
    // Cargar primero los pets
    this.petsService.getPet().subscribe({
      next: (pets) => {
        pets.forEach(pet => this.petMap.set(pet.id, pet));
        this.cargarSolicitudes();
      },
      error: () => this.cargarSolicitudes() // Continuar aunque falle
    });
  }

  private cargarSolicitudes() {
    const dni = this.userService.getUser()?.dni ?? null;

    if(!dni){
      this.error = 'Inicia sesion para ver tus solicitudes';
      this.loading = false;
      return;
    }

    this.solicitudes.listByUser(dni).subscribe({
      next: list => { 
        this.data = list; 
        this.loading = false; 
      },
      error: _ => { 
        this.error = 'No se pudo cargar'; 
        this.loading = false; 
      }
    });
  }

  // Método para obtener nombre del animal
  getNombreAnimal(animalId: string): string {
    return this.petMap.get(animalId)?.name || `Animal #${animalId}`;
  }

  // M�todo para obtener imagen del animal
  getImagenAnimal(animalId: string): string {
    return this.petMap.get(animalId)?.image || '';
  }

  // Método para obtener badge de estado con color
  getEstadoClase(estado: string): string {
    return `estado-${estado}`;
  }

  // Cancelar  solicitud (usuario)
  cancelarSolicitud(s: Solicitud) {
    if (!confirm('Seguro queres cancelar esta solicitud?')) return;

    this.solicitudes.cambiarEstado(s.id, 'cancelada', 'Cancelada por el usuario').subscribe({
      next: () => {
        // Actualizo el objeto en memoria para que se vea el cambio
        s.estado = 'cancelada';
        s.comentarios = 'Cancelada por el usuario';
        // Si preferís recargar todo:
        // this.cargarSolicitudes();
      },
      error: () => alert('No se pudo cancelar la solicitud')
    });
  }

  // trackBy para *ngFor: optimiza el render reutilizando filas por id
  trackById = (_: number, s: Solicitud) => s.id;
}
