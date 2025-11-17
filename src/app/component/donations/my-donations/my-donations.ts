import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Donationsservice } from '../../../services/donationsservice';
import { AuthService } from '../../../auth/auth-service';
import { Donation } from '../../../models/donation';

@Component({
  selector: 'app-my-donations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './my-donations.html',
  styleUrls: ['./my-donations.css']
})
export class MyDonations implements OnInit {

  myDonations: Donation[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(
    private donationsServ: Donationsservice,
    private auth: AuthService
  ) {}

  ngOnInit(): void {

    const userId = this.auth.getCurrentUsername();

    if (!userId) {
      this.errorMessage = 'Debés iniciar sesión para ver tus donaciones.';
      return;
    }

    this.donationsServ.getByUser(userId).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.errorMessage = 'Aún no has realizado donaciones.';
        } else {
          this.myDonations = data.sort((a, b) => b.date.localeCompare(a.date));
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus donaciones.';
        this.isLoading = false;
      }
    });
  }

  getTotal(): number {
    return this.myDonations.reduce((acc, d) => acc + d.amount, 0);
  }
}
