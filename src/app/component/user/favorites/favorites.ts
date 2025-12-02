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

  favorites: (Pets & { adopted?: boolean })[] = [];
  errorMessage = '';

  constructor(
    private favoriteService: FavoriteService,
    private auth: AuthService,
    private router: Router
  ) {}

 async ngOnInit() {

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
    const favs = this.favoriteService.getFavorites();

    //Verificar si algun animal fue adoptado
    this.favorites = await Promise.all(
      favs.map(async (fav) => {
        const adopted = await this.favoriteService.checkAdopted(fav.id);
        return { ...fav, adopted};
      })
    );
    //this.favoriteService.checkAdopted();
  }


  remove(id: string) {
    this.favoriteService.removeFavorite(id);
    this.favorites = this.favoriteService.getFavorites();
  }
}
