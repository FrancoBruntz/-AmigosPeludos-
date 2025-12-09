import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import usuarios from '../models/user';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
import { UserService } from '../component/user/user.service';
import { map } from 'rxjs/operators';
import { NotificacionService } from '../services/notificacionservice';
import { effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = environment.urlUser;

  // señales ligadas a localStorage
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
    private notificacionService: NotificacionService
  ) {
    effect(() => {
    const user = this.currentUser();
    if (user) {
      this.notificacionService.cargarPorUsuario(user.user);
    }
  });
  }

// ===== LOGIN =====
logIn(user: string, password: string) {
  const requestParams = {
    user: user,
    password: password,
  };

  let params = new HttpParams({ fromObject: requestParams });

  this.http.get<usuarios[]>(this.url, { params }).subscribe({
    next: (data) => {
      console.log('login data:', data);

      const u = data[0];

      if (u) {
        // ✅ Guardar en UserService para sincronizar perfil completo
        this.userService.saveCurrent({
          id: u.id,
          user: u.user,              // ahora sí guardamos el user real
          password: u.password,      // y también el password
          isAdmin: u.isAdmin,

          // dni: si existe en el JSON lo uso, si no uso el user como fallback
          dni: u.dni ?? u.user,

          nombre: u.nombre ?? '',
          apellido: u.apellido ?? '',
          email: u.email ?? '',
          telefono: u.telefono ?? '',
          direccion: u.direccion ?? ''
          // favoritos y notificaciones quedan undefined por ahora (opcionales)
        });

        // Mantengo tu lógica previa de auth-service
        this.currentUser.set(u);

        localStorage.setItem('user', u.user);
        localStorage.setItem('isLogIn', JSON.stringify(true));
        this.isLogIn.set(true);

        localStorage.setItem('isAdmin', JSON.stringify(u.isAdmin));
        this.isAdmin.set(u.isAdmin);

        alert('Inicio de sesión con éxito!');
        this.router.navigateByUrl('/'); // o '/sobreellos' si preferís
      } else {
        alert('Usuario o contraseña incorrecta');
      }
    },
    error: (e) => {
      console.error(e);
      alert('Usuario o contraseña incorrecta');
    },
  });
}

  // ===== LOGOUT =====
  logOut() {
    this.isLogIn.set(false);
    this.isAdmin.set(false);

    this.currentUser.set(null);


    this.userService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('isLogIn');
    localStorage.removeItem('isAdmin');
    this.router.navigateByUrl('/login');
  }

  // ===== REGISTRO =====
  registro(dni: string, password: string) {
    const user = {
      user: dni,          // se guarda el dni en el campo user
      password: password,
      isAdmin: false,
    };

    this.verificarDNIUnico(dni).subscribe({
      next: (esUnico) => {
        if (!esUnico) {
          alert('DNI ya registrado en el sistema');
          return;
        }

        // Si es único, registramos
        this.http.post<usuarios>(this.url, user).subscribe({
          next: (data) => {
            alert('Registro exitoso');
            this.logIn(dni, password);
          },
          error: (e) => {
            console.error(e);
            alert('Ocurrió un error al registrar');
          },
        });
      },
      error: (e) => {
        console.error(e);
        alert('Error al verificar el DNI');
      },
    });
  }

  // ===== OBTENER USERNAME ACTUAL =====
  getCurrentUsername(): string | null {
    return localStorage.getItem('user');
  }

  // ===== VERIFICAR DNI ÚNICO =====
  verificarDNIUnico(dni: string) {
    // En el JSON el campo donde se guarda el DNI es "user"
    const params = new HttpParams().set('user', dni);

    return this.http.get<usuarios[]>(this.url, { params }).pipe(
      map((data) => {
        // true si NO hay nadie con ese DNI
        return data.length === 0;
      })
    );
  }

  // ===== UPDATE USER =====
  updateUser(id: string, data: Partial<usuarios>) {
    return this.http.patch<usuarios>(`${this.url}/${id}`, data);
  }
}