import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import usuarios from '../models/user';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
import { UserService } from '../component/user/user.service';
import { map } from 'rxjs/operators';
import { NotificacionService } from '../services/notificacionservice';
import { effect } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private url = environment.urlUser;

  public readonly isLogIn = signal<boolean>(
    JSON.parse(localStorage.getItem('isLogIn') ?? 'false')
  );

  public readonly isAdmin = signal<boolean>(
    JSON.parse(localStorage.getItem('isAdmin') ?? 'false')
  );

  public readonly currentUser = signal<usuarios | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private notificacionService: NotificacionService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {
    effect(() => {
      const user = this.currentUser();
      if (user) this.notificacionService.cargarPorUsuario(user.user);
    });
  }

  // ========= LOGIN ==========
  logIn(user: string, password: string) {
    const params = new HttpParams().set('user', user).set('password', password);

    this.http.get<usuarios[]>(this.url, { params }).subscribe({
      next: (data) => {
        const u = data[0];

        if (u) {
          // Guardar perfil completo
          this.userService.saveCurrent({
            id: u.id,
            user: u.user,
            password: u.password,
            isAdmin: u.isAdmin,
            dni: u.dni ?? u.user,
            nombre: u.nombre ?? '',
            apellido: u.apellido ?? '',
            email: u.email ?? '',
            telefono: u.telefono ?? '',
            direccion: u.direccion ?? ''
          });

          this.currentUser.set(u);

          localStorage.setItem('user', u.user);
          localStorage.setItem('isLogIn', JSON.stringify(true));
          this.isLogIn.set(true);

          localStorage.setItem('isAdmin', JSON.stringify(u.isAdmin));
          this.isAdmin.set(u.isAdmin);

          // Snackbar
          this.snack.open('Inicio de sesión con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.router.navigateByUrl('/');
        } else {
          this.snack.open('DNI o contraseña incorrecta', 'Cerrar', {
            duration: 3500,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: () => {
        this.snack.open('DNI o contraseña incorrecta', 'Cerrar', {
          duration: 3500,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  // ==== LOGOUT =====
  logOut() {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Deseás cerrar sesión?' }
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;

      this.isLogIn.set(false);
      this.isAdmin.set(false);
      this.currentUser.set(null);

      this.userService.logout();

      localStorage.removeItem('user');
      localStorage.removeItem('isLogIn');
      localStorage.removeItem('isAdmin');

      this.snack.open('Sesión cerrada correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.router.navigateByUrl('/login');
    });
  }

  // =============== REGISTRO ===============
  registro(dni: string, password: string) {
    const user = { user: dni, password, isAdmin: false };

    this.verificarDNIUnico(dni).subscribe({
      next: (esUnico) => {
        if (!esUnico) {
          this.snack.open('DNI ya registrado', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        this.http.post<usuarios>(this.url, user).subscribe({
          next: () => {
            this.snack.open('Registro exitoso', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.logIn(dni, password);
          },
          error: () => {
            this.snack.open('Error al registrar', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          },
        });
      },
      error: () => {
        this.snack.open('Error verificando DNI', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  // ====== UTILS ======
  getCurrentUsername() {
    return localStorage.getItem('user');
  }

  verificarDNIUnico(dni: string) {
    const params = new HttpParams().set('user', dni);
    return this.http.get<usuarios[]>(this.url, { params }).pipe(
      map(data => data.length === 0)
    );
  }

  updateUser(id: string, data: Partial<usuarios>) {
    return this.http.patch<usuarios>(`${this.url}/${id}`, data);
  }
}
