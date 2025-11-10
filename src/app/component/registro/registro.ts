import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  loginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
     private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      dni: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{7,8}$/) // DNI argentino: 7 u 8 dígitos
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if(this.loginForm.valid){
      const { dni, password } = this.loginForm.value;

      this.authService.registro(dni, password);
    }
  }


}
