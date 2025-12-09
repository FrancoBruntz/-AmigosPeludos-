import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import type usuarios from '../../models/user';
import { environment } from '../../../environments/environment.development';
import { map } from 'rxjs';

export interface UserProfile {
  id: string;          // id del JSON-server
  user: string;        // lo que usás para loguear (DNI o "admin")
  password?: string;   // opcional, no siempre lo necesitamos en front
  isAdmin: boolean;

  dni: string;         // clave principal lógica del adoptante
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;

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

  private url = environment.urlUser;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  // ================== Helpers internos ==================

  private loadCurrent(): UserProfile | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  /** Normaliza lo que viene del JSON ("usuarios") a nuestro UserProfile */
  private normalizeProfile(raw: any): UserProfile | null {
    if (!raw) return null;

    const dni = raw.dni ?? raw.user;   // en tu JSON a veces está en dni, a veces en user
    if (!dni) return null;

    return {
      id: raw.id,
      user: raw.user ?? dni,
      password: raw.password,
      isAdmin: !!raw.isAdmin,
      dni,

      nombre: raw.nombre ?? '',
      apellido: raw.apellido ?? '',
      email: raw.email ?? '',
      telefono: raw.telefono ?? '',
      direccion: raw.direccion ?? '',

      favoritos: raw.favoritos ?? [],
      notificaciones: raw.notificaciones ?? []
    };
  }

  // ================== Sesión / perfil actual ==================

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

  // ================== Favoritos ==================

  addFavorite(petId: string) {
    const user = this.currentUser();
    if (!user) return;

    const favoritos = user.favoritos ?? [];
    if (!favoritos.includes(petId)) {
      const updated: UserProfile = {
        ...user,
        favoritos: [...favoritos, petId]
      };
      this.saveCurrent(updated);
    }
  }

  removeFavorite(petId: string) {
    const user = this.currentUser();
    if (!user) return;

    const updated: UserProfile = {
      ...user,
      favoritos: (user.favoritos ?? []).filter(id => id !== petId)
    };
    this.saveCurrent(updated);
  }

  getFavorites(): string[] {
    return this.currentUser()?.favoritos ?? [];
  }

  // ================== Notificaciones locales (no las del JSON-server) ==================

  pushNotification(message: string) {
    const user = this.currentUser();
    if (!user) return;

    const note = {
      id: Date.now().toString(),
      message,
      date: new Date().toISOString(),
      read: false
    };

    const updated: UserProfile = {
      ...user,
      notificaciones: [note, ...(user.notificaciones ?? [])]
    };

    this.saveCurrent(updated);
  }

  markAsRead(noteId: string) {
    const user = this.currentUser();
    if (!user || !user.notificaciones) return;

    const updated: UserProfile = {
      ...user,
      notificaciones: user.notificaciones.map(n =>
        n.id === noteId ? { ...n, read: true } : n
      )
    };

    this.saveCurrent(updated);
  }

  clearNotifications() {
    const user = this.currentUser();
    if (!user) return;

    const updated: UserProfile = {
      ...user,
      notificaciones: []
    };

    this.saveCurrent(updated);
  }

  // ================== Actualizar en el JSON-server ==================

  updateUser(id: string, data: Partial<usuarios>) {
    return this.http.patch<usuarios>(`${this.url}/${id}`, data);
  }

  updateUserOnServer(id: string, updatedData: any) {
    return this.http.patch(`${environment.urlUser}/${id}`, updatedData);
  }

  /** Actualiza SOLO el perfil en memoria + localStorage */
  updateProfile(partial: Partial<UserProfile>) {
    const user = this.currentUser();
    if (!user) return;

    const merged: UserProfile = { ...user, ...partial };
    this.saveCurrent(merged);
  }

  /** Carga desde el servidor por ID y pisa el currentUser */
  loadUserProfile(id: string) {
    this.http.get<any>(`${this.url}/${id}`).subscribe({
      next: raw => {
        const perfil = this.normalizeProfile(raw);
        if (perfil) {
          this.saveCurrent(perfil);
        }
      },
      error: err => console.error('Error cargando perfil', err)
    });
  }

  // ================== Buscar usuarios por DNI (para admin, detalles, etc.) ==================

  getByDni(dni: string) {
    return this.http
      .get<any[]>(`${this.url}?user=${encodeURIComponent(dni)}`)
      .pipe(
        map(list =>
          list
            .map(raw => this.normalizeProfile(raw))
            .filter((p): p is UserProfile => p !== null)
        )
      );
  }
}
