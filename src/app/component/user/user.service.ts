import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import type usuarios from '../../models/user';
import { environment } from '../../../environments/environment.development';

export interface UserProfile extends usuarios {
  dni?: string;
  favoritos?: string[];
  notificaciones?: Array<{
    id: string;
    message: string;
    date: string;
    read: boolean;
  }>;
}

const USER_KEY = 'amigospeludos_user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public currentUser = signal<UserProfile | null>(this.loadCurrent());

  constructor(private router: Router, private http: HttpClient) {}
  
  private url = environment.urlUser;

  private loadCurrent(): UserProfile | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
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

  // ===== FAVORITOS =====
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

  // ===== NOTIFICACIONES LOCALES =====
  pushNotification(message: string) {
    const user = this.currentUser();
    if (!user) return;
    const note = {
      id: Date.now().toString(),
      message,
      date: new Date().toISOString(),
      read: false
    };
    user.notificaciones = user.notificaciones || [];
    user.notificaciones.unshift(note);
    this.saveCurrent(user);
  }

  markAsRead(noteId: string) {
    const user = this.currentUser();
    if (!user || !user.notificaciones) return;
    user.notificaciones = user.notificaciones.map(n =>
      n.id === noteId ? { ...n, read: true } : n
    );
    this.saveCurrent(user);
  }

  clearNotifications() {
    const user = this.currentUser();
    if (!user) return;
    user.notificaciones = [];
    this.saveCurrent(user);
  }

  // ===== UPDATE EN JSON-SERVER =====
  updateUser(id: string, data: Partial<usuarios>) {
    return this.http.patch<usuarios>(`${this.url}/${id}`, data);
  }
  
  updateUserOnServer(id: string, updatedData: any) {
    return this.http.patch(`${environment.urlUser}/${id}`, updatedData);
  }

  // actualizar perfil en localStorage
  updateProfile(partial: Partial<UserProfile>) {
    const user = this.currentUser() || {
      id: '',
      user: '',
      password: '',
      isAdmin: false,
      nombre: '',
      apellido: ''
    } as UserProfile;

    const merged = { ...user, ...partial };
    this.saveCurrent(merged);
  }

  // cargar perfil desde backend por id
  loadUserProfile(id: string) {
    this.http.get<UserProfile>(`${this.url}/${id}`).subscribe({
      next: perfil => {
        if (perfil) {
          this.saveCurrent(perfil);
        }
      },
      error: err => console.error('Error cargando perfil', err)
    });
  }

  // buscar usuario por dni (que en tu sistema se guarda en "user")
  getByDni(dni: string) {
    return this.http.get<UserProfile[]>(
      `${this.url}?user=${encodeURIComponent(dni)}`
    );
  }
}
