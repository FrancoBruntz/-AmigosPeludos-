import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { NotificacionService } from '../services/notificacionservice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected authService: AuthService,
    protected notifService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      
      this.notifService.mostrarSnackbar(
        'Por favor, completá todos los campos correctamente.',
        'error'
      );

      return;
    }

    const { dni, password } = this.loginForm.value;
    this.authService.logIn(dni, password);

    // Esperamos un instante para que el servicio actualice el usuario
    setTimeout(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.notifService.cargarPorUsuario(user.user);

        this.notifService.mostrarSnackbar(
          'Inicio de sesión exitoso.',
          'exito'
        );
      } else {
        this.notifService.mostrarSnackbar(
          'DNI o contraseña incorrectos.',
          'error'
        );
      }
    }, 150);
  }

  irARegistro(): void {
    this.router.navigate(['/register']);
  }
}
