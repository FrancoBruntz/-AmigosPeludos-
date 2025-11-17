import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../../services/favorite.service';
import Pets from '../../../models/pets';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent {

  favorites: Pets[] = [];

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit() {
    this.favorites = this.favoriteService.getFavorites();
  }

  remove(id: string) {
    this.favoriteService.removeFavorite(id);
    this.favorites = this.favoriteService.getFavorites();
  }
}
