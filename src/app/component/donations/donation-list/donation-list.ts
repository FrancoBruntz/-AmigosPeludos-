import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Donation } from '../../../models/donation';
import { Donationsservice } from '../../../services/donationsservice';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-donation-list',
  imports: [FormsModule, DatePipe, FormsModule, RouterModule],
  templateUrl: './donation-list.html',
  styleUrl: './donation-list.css',
})
export class DonationList  implements OnInit{
  donations: Donation[] = [];
  filteredDonations: Donation[] = [];
  errorMessage = '';

  selectedMethod = 'Todas';
  minAmount?: number;
  userIdFilter = ''; 

  constructor(private donationsServ: Donationsservice, 
              private location: Location) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.donationsServ.getAllDonations().subscribe({
      next: (data) => {
        this.donations = data.sort((a, b) => b.date.localeCompare(a.date));
        this.filteredDonations = [...this.donations];
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el historial de donaciones.';
      }
    });
  }

   applyFilter(): void {
    const hasMethod = this.selectedMethod !== 'Todas';
    const hasUserId = this.userIdFilter.trim() !== '';

    // Si no hay filtros por método ni userId → trabajo sobre el array completo
    if (!hasMethod && !hasUserId) {
      this.filteredDonations = this.applyMinAmount(this.donations);
      return;
    }

    const params: { userId?: string; method?: string } = {};

    if (hasMethod) {
      params.method = this.selectedMethod;
    }

    if (hasUserId) {
      params.userId = this.userIdFilter.trim();
    }

    // Llamo al back (json-server) con filtro de método / userId
    this.donationsServ.filter(params).subscribe({
      next: (data) => {
        const ordered = data.sort((a, b) => b.date.localeCompare(a.date));
        this.filteredDonations = this.applyMinAmount(ordered);
      },
      error: () => {
        this.errorMessage = 'No se pudieron aplicar los filtros.';
      }
    });
  }

  // Aplico filtro de monto mínimo en el front
  private applyMinAmount(list: Donation[]): Donation[] {
    if (!this.minAmount) return list;
    return list.filter(d => d.amount >= this.minAmount!);
  }

  getTotal(): number {
    return this.filteredDonations.reduce((acc, d) => acc + d.amount, 0);
  }

  goBack() {
    this.location.back();           
  }
}
