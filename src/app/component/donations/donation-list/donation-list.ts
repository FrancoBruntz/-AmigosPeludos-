import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Donation } from '../../../models/donation';
import { Donationsservice } from '../../../services/donationsservice';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-donation-list',
  imports: [FormsModule, DatePipe, RouterModule,CurrencyPipe, TitleCasePipe],
  templateUrl: './donation-list.html',
  styleUrl: './donation-list.css',
})
export class DonationList  implements OnInit{
  
   donations: Donation[] = [];          // todas las donaciones (backup)
  filteredDonations: Donation[] = [];  // lo que se muestra en la tabla
  errorMessage = '';

  // filtros
  selectedMethod = 'Todas';
  minAmount?: number;
  userIdFilter = '';

  dateFrom?: string; // formato yyyy-MM-dd (del input type="date")
  dateTo?: string;   // formato yyyy-MM-dd

  constructor(private donationsServ: Donationsservice) {}

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

    // Si no hay filtros por método ni userId → trabajo solo en el front
    if (!hasMethod && !hasUserId) {
      this.filteredDonations = this.applyClientFilters(this.donations);
      return;
    }

    const params: { userId?: string; method?: string } = {};

    if (hasMethod) {
      params.method = this.selectedMethod;
    }

    if (hasUserId) {
      params.userId = this.userIdFilter.trim();
    }

    // Filtro por método / userId usando json-server
    this.donationsServ.filter(params).subscribe({
      next: (data) => {
        const ordered = data.sort((a, b) => b.date.localeCompare(a.date));
        // Después aplico filtros de monto y fechas en el cliente
        this.filteredDonations = this.applyClientFilters(ordered);
      },
      error: () => {
        this.errorMessage = 'No se pudieron aplicar los filtros.';
      }
    });
  }

  // Aplica monto mínimo + rango de fechas (cliente)
  private applyClientFilters(list: Donation[]): Donation[] {
    return list.filter(d => {

      // monto mínimo
      const amountOk = this.minAmount ? d.amount >= this.minAmount! : true;

      // fecha
      const donationDate = d.date?.slice(0, 10); // "YYYY-MM-DD"
      let dateOk = true;

      if (this.dateFrom) {
        dateOk = dateOk && (!!donationDate && donationDate >= this.dateFrom);
      }
      if (this.dateTo) {
        dateOk = dateOk && (!!donationDate && donationDate <= this.dateTo);
      }

      return amountOk && dateOk;
    });
  }

  getTotal(): number {
    return this.filteredDonations.reduce((acc, d) => acc + d.amount, 0);
  }

}
