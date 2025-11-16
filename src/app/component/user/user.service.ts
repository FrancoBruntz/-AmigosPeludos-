import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface UserProfile {
  dni: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  isAdmin?: boolean;
  favoritos?: string[]; // lista de IDs de mascotas favoritas
  notificaciones?: Array<{ id: string; message: string; date: string; read: boolean }>;
}

const USER_KEY = 'amigospeludos_user'; // para perfil actual
const USERS_STORE = 'amigospeludos_users'; // para simular varios usuarios

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // simple reactive signals (si tu Angular soporta signals en tu versión)
  public currentUser = signal<UserProfile | null>(this.loadCurrent());
  constructor(private router: Router) {}

  private loadCurrent(): UserProfile | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch { return null; }
  }

  getUser(): UserProfile | null {
  return this.currentUser();
}

  saveCurrent(profile: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    this.currentUser.set(profile);
  }

  logout() {
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // favoritos
  addFavorite(petId: string) {
    const user = this.currentUser();
    if (!user) return;
    user.favoritos = user.favoritos || [];
    if (!user.favoritos.includes(petId)) {
      user.favoritos.push(petId);
      this.saveCurrent(user);
    }
  }

  removeFavorite(petId: string) {
    const user = this.currentUser();
    if (!user) return;
    user.favoritos = (user.favoritos || []).filter(id => id !== petId);
    this.saveCurrent(user);
  }

  getFavorites(): string[] {
    return this.currentUser()?.favoritos || [];
  }

  // notificaciones
  pushNotification(message: string) {
    const user = this.currentUser();
    if (!user) return;
    const note = { id: Date.now().toString(), message, date: new Date().toISOString(), read: false };
    user.notificaciones = user.notificaciones || [];
    user.notificaciones.unshift(note);
    this.saveCurrent(user);
  }

  markAsRead(noteId: string) {
    const user = this.currentUser();
    if (!user || !user.notificaciones) return;
    user.notificaciones = user.notificaciones.map(n => n.id === noteId ? {...n, read: true} : n);
    this.saveCurrent(user);
  }

  clearNotifications() {
    const user = this.currentUser();
    if (!user) return;
    user.notificaciones = [];
    this.saveCurrent(user);
  }

  // actualizar perfil parcialmente
  updateProfile(partial: Partial<UserProfile>) {
    const user = this.currentUser() || { dni: '', nombre: '', apellido: '' } ;
    const merged = { ...user, ...partial };
    this.saveCurrent(merged);
  }
}
