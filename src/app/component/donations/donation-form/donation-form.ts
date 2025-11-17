import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Donationsservice } from '../../../services/donationsservice';
import { Donation } from '../../../models/donation';
import { AuthService } from '../../../auth/auth-service';

@Component({
  selector: 'app-donation-form',
  standalone: true,
  imports: [ReactiveFormsModule, ɵInternalFormsSharedModule],
  templateUrl: './donation-form.html',
  styleUrls: ['./donation-form.css'],
})
export class DonationForm implements OnInit {

  form!: FormGroup;

  methods = ['Tarjeta', 'Transferencia', 'Efectivo'];

  readonly transferAlias = 'animales.peludos.refugio';
  readonly transferCbu = '0000003100045678912345';

  constructor(
    private fb: FormBuilder,
    private donationsServ: Donationsservice,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {

    // Chequeo de login
    if (!this.authService.isLogIn()) {
      alert('Para realizar una donación debés iniciar sesión.');
      this.router.navigate(['/login']);
      return;
    }

    // Crear formulario
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(100)]],
      method: ['', [Validators.required]],
      message: ['', [Validators.maxLength(200)]],

      // TARJETA
      cardNumber: [''],
      cardHolder: [''],
      expiration: [''],
      cvv: [''],

      // TRANSFERENCIA
      alias: [this.transferAlias],
      cbu: [this.transferCbu]
    });

  }

  // Helpers
  isCardMethod(): boolean {
    return this.form.get('method')?.value === 'Tarjeta';
  }

  isTransferMethod(): boolean {
    return this.form.get('method')?.value === 'Transferencia';
  }

  getControl(name: string) {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.touched && control.invalid);
  }

  hasError(name: string, error: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.touched && control.hasError(error));
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Obtener usuario logueado
    const currentUserId = this.authService.getCurrentUsername();

    // Seguridad extra: si por alguna razón no hay usuario, mando a login
    if (!currentUserId) {
      alert('Debés iniciar sesión para realizar una donación.');
      this.router.navigate(['/login']);
      return;
    }

    // Valores del formulario
    const { amount, method, message } = this.form.value;

    const donation: Donation = {
      userId: currentUserId,
      amount,
      method,
      message,
      date: new Date().toISOString()
    };

    // Registrar donación
    this.donationsServ.addDonation(donation).subscribe({
      next: () => {
        alert('Donación confirmada con éxito. ¡Gracias por tu donación! 🐶💛');
        this.router.navigate(['/mis-donaciones']);  // ir a donaciones
      },
      error: () => {
        alert('Ocurrió un error al registrar la donación.');
      }
    });

  }

}