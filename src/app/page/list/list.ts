import { Component, OnInit, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Pets from '../../models/pets';
import { Petsservice } from '../../services/petsservice';
import { AuthService } from '../../auth/auth-service';
import { FavoriteService } from '../../services/favorite.service';


@Component({
  selector: 'app-list',
  imports: [ RouterLink,FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit{

  // lista que se muestra en pantalla
  pets = signal<Pets[]>([]);

  // lista completa 
  private allPets: Pets[] = [];

  // filtro de algun tipo
  selectedType: '' | 'Perro' | 'Gato' = '';

  // toggle historial (true = inactivos/adoptados)
  protected showOnlyAvailable = false;

  constructor(
    private listaPets: Petsservice,
    private router: Router,
    protected auth: AuthService, 
    private favoriteService : FavoriteService
  ) {}

  ngOnInit() {
    this.loadActivePets();
  }

  // aplica filtro de perro o gato a la lista de animales
  applyFilter() {
    let filtrados = this.allPets;

    if (this.selectedType) {
      filtrados = this.allPets.filter(pet => pet.type === this.selectedType);
    }

    this.pets.set([...filtrados]);
  }

  // Animales activos (disponibles)
  private loadActivePets() {
    this.listaPets.getPetActivos().subscribe({
      next: (data) => { 
        this.allPets = data;  // guardar lista completa
        this.applyFilter();   // aplicar filtro si existe
      },
      error: (e) => {
        alert('Algo salió mal ' + e);
      }
    });
  }

  // Animales inactivos (historial / adoptados)
  private loadInactivePets() {
    this.listaPets.getPetInactives().subscribe({
      next: (data) => {
        this.allPets = data;  // guardar lista completa
        this.applyFilter();   // aplicar filtro si existe
      },
      error: (e) => {
        alert('Algo salió mal ' + e);
      }
    });
  }

  // Toggle historial (solo admin)
  onToggle(checked: boolean) {
    this.showOnlyAvailable = checked;
    if (checked) {
      this.loadInactivePets();
    } else {
      this.loadActivePets();
    }
  }

  eliminarPet(id: string) {
    if (confirm('¿Desea eliminar este animal?')) {
      this.listaPets.deletePet(id).subscribe({
        next: () => {
          // recargar según vista actual
          this.showOnlyAvailable ? this.loadInactivePets() : this.loadActivePets();
          this.router.navigateByUrl('/sobreellos');
        },
        error: (e) => {
          alert('Algo salió mal ' + e);
        }
      });
    }
  }

  agregarFavorito(pet: Pets) {
  this.favoriteService.addFavorite(pet);
  alert(pet.name + " fue agregado a favoritos 🩷");
}

}
