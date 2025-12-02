import { inject, Injectable } from '@angular/core';
import Pets from '../models/pets';
import { UserService } from '../component/user/user.service';
import { NotificacionService } from './notificacionservice';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

 private storagePrefix = 'favoritePets_';

 private notification = inject(NotificacionService);

  constructor(private userService: UserService) {}

  /**
   * Obtiene la clave de localStorage correspondiente al usuario actual.
   * Ejemplo: favoritePets_12345678
   */
  private getStorageKey(): string | null {
    const user = this.userService.getUser(); // { dni, nombre, apellido, isAdmin }

    if (!user || !user.dni) return null;

    return this.storagePrefix + user.dni;
  }

  /**
   * Devuelve los favoritos del usuario actual.
   */
  getFavorites(): Pets[] {
    const key = this.getStorageKey();
    if (!key) return [];

    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Guarda la lista actualizada de favoritos del usuario actual.
   */
  private saveFavorites(list: Pets[]): void {
    const key = this.getStorageKey();
    if (!key) return;

    localStorage.setItem(key, JSON.stringify(list));
  }

  /**
   * Agrega un favorito al usuario actual, sin duplicados.
   */
  addFavorite(pet: Pets): void {
    const key = this.getStorageKey();
    if (!key) return; // si no hay usuario logueado, no hacer nada

    const current = this.getFavorites();

    // evitar duplicados
    if (!current.some(f => f.id === pet.id)) {
      current.push(pet);
      this.saveFavorites(current);
    }
  }

  /**
   * Elimina un favorito del usuario actual.
   */
  removeFavorite(id: string): void {
    const key = this.getStorageKey();
    if (!key) return;

    const filtered = this.getFavorites().filter(f => f.id !== id);
    this.saveFavorites(filtered);
  }

  /**
   * Verifica si un pet ya es favorito del usuario actual.
   */
  isFavorite(id: string): boolean {
    return this.getFavorites().some(f => f.id === id);
  }

  /**
   * Limpia todos los favoritos del usuario actual.
   */
  clearFavorites(): void {
    const key = this.getStorageKey();
    if (!key) return;

    localStorage.removeItem(key);
  }

 async checkAdopted(petId: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3000/pets/${petId}`);
    const pet = await res.json();

    // Si no existe pet, lo consideramos adoptado/inactivo
    if (!pet) return true;

    // SI activo === false → fue adoptado
    return pet.activo === false;

  } catch (e) {
    console.error("Error verificando adopción:", e);
    return false;
  }
}


}
