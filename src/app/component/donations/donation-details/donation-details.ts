import { Component, OnInit } from '@angular/core';
import { Donation } from '../../../models/donation';
import { ActivatedRoute, Router } from '@angular/router';
import { Donationsservice } from '../../../services/donationsservice';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-donation-details',
  imports: [DatePipe],
  templateUrl: './donation-details.html',
  styleUrl: './donation-details.css',
})

export class DonationDetails implements OnInit {

  donation?: Donation;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private donationsServ: Donationsservice
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'No se encontró el identificador de la donación.';
      this.isLoading = false;
      return;
    }

    this.donationsServ.getDonationById(id).subscribe({
      next: (data) => {
        this.donation = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se encontró la donación solicitada.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/donaciones']);
  }
}