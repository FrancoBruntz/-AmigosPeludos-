import { Component, OnInit } from '@angular/core';
import { Donationsservice } from '../../../services/donationsservice';
import { AuthService } from '../../../auth/auth-service';
import { Donation } from '../../../models/donation';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-donations',
  imports: [DatePipe],
  templateUrl: './my-donations.html',
  styleUrl: './my-donations.css',
})
export class MyDonations implements OnInit{

  myDonations : Donation[] = [];

  constructor(
    private donationsServ: Donationsservice,
    private authService: AuthService
  ) {}

   ngOnInit(): void {
    const userId = this.authService.getCurrentUsername();

    if (!userId) return;

    this.donationsServ.getByUser(userId).subscribe({
      next: (data) => this.myDonations = data,
      error: () => alert("No pudimos cargar tus donaciones")
    });
  }

}
