import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { Petsservice } from '../../../services/petsservice';
import Solicitud from '../../../models/solicitud';
import Pets from '../../../models/pets';
import { UserService } from '../../../component/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

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
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = true;
  error = '';
  data: Solicitud[] = [];
  petMap: Map<string, Pets> = new Map();

  ngOnInit(): void {
    this.petsService.getPet().subscribe({
      next: (pets) => {
        pets.forEach(pet => this.petMap.set(pet.id, pet));
        this.cargarSolicitudes();
      },
      error: () => this.cargarSolicitudes()
    });
  }

  private cargarSolicitudes() {
    const dni = this.userService.getUser()?.dni ?? null;

    if (!dni) {
      this.error = 'Iniciá sesión para ver tus solicitudes';
      this.loading = false;
      return;
    }

    this.solicitudes.listByUser(dni).subscribe({
      next: list => {
        this.data = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar';
        this.loading = false;
        this.snack.open('Error al cargar solicitudes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getNombreAnimal(animalId: string): string {
    return this.petMap.get(animalId)?.name || `Animal #${animalId}`;
  }

  getImagenAnimal(animalId: string): string {
    return this.petMap.get(animalId)?.image || '';
  }

  getEstadoClase(estado: string): string {
    return `estado-${estado}`;
  }

  cancelarSolicitud(s: Solicitud) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Seguro querés cancelar esta solicitud?' }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.solicitudes.cambiarEstado(s.id, 'cancelada', 'Cancelada por el usuario').subscribe({
        next: () => {
          s.estado = 'cancelada';
          s.comentarios = 'Cancelada por el usuario';

          this.snack.open('Solicitud cancelada', 'OK', {
            duration: 3000
          });
        },
        error: () => {
          this.snack.open('No se pudo cancelar la solicitud', 'Cerrar', {
            duration: 3500
          });
        }
      });
    });
  }

  trackById = (_: number, s: Solicitud) => s.id;
}
