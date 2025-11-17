import { Component, OnInit } from '@angular/core';
import { Donationsservice } from '../../../services/donationsservice';
import { AuthService } from '../../../auth/auth-service';
import { Donation } from '../../../models/donation';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';   

@Component({
  selector: 'app-my-donations',
  imports: [DatePipe],
  templateUrl: './my-donations.html',
  styleUrl: './my-donations.css',
})
export class MyDonations implements OnInit{

  myDonations : Donation[] = [];
  errorMessage = '';

  constructor(
    private donationsServ: Donationsservice,
    private authService: AuthService, 
    private location: Location
  ) {}

   ngOnInit(): void {
    const userId = this.authService.getCurrentUsername();

    if (!userId) {
        this.errorMessage = 'Debés iniciar sesión para ver tus donaciones.';
      return;
    }

    this.donationsServ.getByUser(userId).subscribe({
      next: (data) => {
        // ordeno de la más nueva a la más vieja
        this.myDonations = data.sort((a, b) => b.date.localeCompare(a.date));
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar tus donaciones.';
      }
    });
  }

    getTotal(){
    return this.myDonations.reduce((acc, d) => acc + d.amount, 0);
  }

  goBack() {
    this.location.back();              
  }
}

