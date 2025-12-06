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
    if (this.loginForm.valid) {
      const { dni, password } = this.loginForm.value;

      console.log(dni,password)
      this.authService.logIn(dni, password);
      
      setTimeout(() => {
         const user = this.authService.currentUser();
        if (user) {
          this.notifService.cargarPorUsuario(user.id);
  }
}, 150);
      
    } else {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completá todos los campos correctamente.');
    }
  }

  irARegistro(): void {
    this.router.navigate(['/register']);
  }
}

