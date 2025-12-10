import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Pets from '../../models/pets';
import { Petsservice } from '../../services/petsservice';
import { AuthService } from '../../auth/auth-service';
import { FavoriteService } from '../../services/favorite.service';
import { NotificacionService } from '../../services/notificacionservice';

@Component({
  selector: 'app-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {

  pets = signal<Pets[]>([]);
  private allPets: Pets[] = [];
  selectedType: '' | 'Perro' | 'Gato' = '';
  protected showOnlyAvailable = false;

  constructor(
    private listaPets: Petsservice,
    private router: Router,
    protected auth: AuthService,
    private favoriteService: FavoriteService,
    private notifService: NotificacionService
  ) {}

  ngOnInit() {
    this.loadActivePets();
  }

  applyFilter() {
    let filtrados = this.allPets;

    if (this.selectedType) {
      filtrados = this.allPets.filter(pet => pet.type === this.selectedType);
    }

    this.pets.set([...filtrados]);
  }

  private loadActivePets() {
    this.listaPets.getPetActivos().subscribe({
      next: (data) => {
        this.allPets = data;
        this.applyFilter();
      },
      error: (e) => {
        this.notifService.mostrarSnackbar('Hubo un error cargando los animales.', 'error');
      }
    });
  }

  private loadInactivePets() {
    this.listaPets.getPetInactives().subscribe({
      next: (data) => {
        this.allPets = data;
        this.applyFilter();
      },
      error: (e) => {
        this.notifService.mostrarSnackbar('Hubo un error cargando los animales.', 'error');
      }
    });
  }

  onToggle(checked: boolean) {
    this.showOnlyAvailable = checked;
    if (checked) {
      this.loadInactivePets();
    } else {
      this.loadActivePets();
    }
  }

  async cambiarEstadoPet(id: string, estado: boolean) {
    let mensaje = estado
      ? '¿Desea dar de alta este animal?'
      : '¿Desea dar de baja este animal?';

    const confirmar = await this.notifService.confirmar(mensaje);

    if (!confirmar) return;

    this.listaPets.cambiarActivoPet(id, estado).subscribe({
      next: () => {
        this.showOnlyAvailable ? this.loadInactivePets() : this.loadActivePets();
        this.router.navigateByUrl('/sobreellos');

        this.notifService.mostrarSnackbar(
          estado ? 'Animal dado de alta.' : 'Animal dado de baja.',
          'exito'
        );
      },
      error: () => {
        this.notifService.mostrarSnackbar('Hubo un error procesando la operación.', 'error');
      }
    });
  }

  agregarFavorito(pet: Pets) {
    this.favoriteService.addFavorite(pet);
    this.notifService.mostrarSnackbar(`${pet.name} fue agregado a favoritos 🩷`, 'exito');
  }
}
