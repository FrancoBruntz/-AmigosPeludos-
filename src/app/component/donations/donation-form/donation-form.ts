import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Donationsservice } from '../../../services/donationsservice';
import { Router } from '@angular/router';
import { Donation } from '../../../models/donation';
import { AuthService } from '../../../auth/auth-service';

@Component({
  selector: 'app-donation-form',
  imports: [],
  templateUrl: './donation-form.html',
  styleUrl: './donation-form.css',
})

export class DonationForm implements OnInit{

   form!: FormGroup;

  methods = ['Tarjeta', 'Transferencia', 'Efectivo'];

  constructor(
    private fb: FormBuilder,
    private donationsServ: Donationsservice,
    private router: Router, 
     private authService: AuthService,
  ) {}

   ngOnInit(): void {
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(100)]],
      method: ['', [Validators.required]],
      message: ['', [Validators.maxLength(200)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Tomamos el usuario logueado desde AuthService
    const currentUserId = this.authService.getCurrentUsername();

      if (!currentUserId) {
      alert('Debés iniciar sesión para realizar una donación.');
      this.router.navigate(['/login']);
      return;
    }

    const { amount, method, message } = this.form.value;

    const donation: Donation = {
      // id lo genera json-server, por eso no lo seteamos
      userId: currentUserId,
      amount,
      method,
      message,
      date: new Date().toISOString()
    };

    this.donationsServ.addDonation(donation).subscribe({
      next: () => {
        alert('¡Gracias por tu donación! 💚');
        this.router.navigate(['/mis-donaciones']); // o donde quieras redirigir
      },
      error: () => {
        alert('Ocurrió un error al registrar la donación.');
      }
    });
  }

}
