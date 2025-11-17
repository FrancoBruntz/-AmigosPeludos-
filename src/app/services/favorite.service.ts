import { Injectable } from '@angular/core';
import Pets from '../models/pets';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private storageKey = 'favoritePets';

  getFavorites(): Pets[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  addFavorite(pet: Pets) {
    const current = this.getFavorites();
    if (!current.some(f => f.id === pet.id)) {
      current.push(pet);
      localStorage.setItem(this.storageKey, JSON.stringify(current));
    }
  }

  removeFavorite(id: string) {
    const current = this.getFavorites().filter(f => f.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(current));
  }
}
