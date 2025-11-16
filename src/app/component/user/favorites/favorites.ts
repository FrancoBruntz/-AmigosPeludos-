import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf y *ngFor

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FavoritesComponent {
  // Lista de favoritos
  favorites = [
    { id: 1, name: 'Dog Park', type: 'Park', description: 'A nice place for dogs to play.' },
    { id: 2, name: 'Pet Store', type: 'Shop', description: 'All pet supplies you need.' },
    { id: 3, name: 'Vet Clinic', type: 'Clinic', description: 'Professional veterinary care.' }
  ];

  // Método para eliminar un favorito
  remove(id: number) {
    this.favorites = this.favorites.filter(fav => fav.id !== id);
  }
}
