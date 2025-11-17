import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../../services/favorite.service';
import Pets from '../../../models/pets';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth-service';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent {

  favorites: Pets[] = [];
  errorMessage = '';

  constructor(
    private favoriteService: FavoriteService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {

    // Si NO está logueado
    if (!this.auth.isLogIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Si es ADMIN, redirigir a home
    if (this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    // Usuario normal sí puede ver sus favoritos
    this.favorites = this.favoriteService.getFavorites();
  }


  remove(id: string) {
    this.favoriteService.removeFavorite(id);
    this.favorites = this.favoriteService.getFavorites();
  }
}
