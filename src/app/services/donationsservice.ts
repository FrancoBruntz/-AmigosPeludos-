import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Donation } from '../models/donation';

@Injectable({
  providedIn: 'root',
})
export class Donationsservice {
  
  private url = 'http://localhost:3000/donations';

  constructor(private http: HttpClient) {}

  // Todas las donaciones (para admin) 
  getAllDonations(){ 
    return this.http.get<Donation[]>(this.url); 
  }

  // Donaciones de un usuario (para historial propio)
  getByUser(userId: string) { 
    return this.http.get<Donation[]>(`${this.url}?userId=${userId}`);
  }

  // Agregar una donación nueva
  addDonation(donation: Donation) { 
    return this.http.post<Donation>(this.url, donation); 
  }

  // Filtro genérico (opcional)
    // Filtro genérico (opcional)
  filter(params: { userId?: number; method?: string }) {
    const query = new URLSearchParams();

    if (params.userId !== undefined) query.set('userId', params.userId.toString());
    if (params.method) query.set('method', params.method);

    const url = `${this.url}?${query.toString()}`;
    return this.http.get<Donation[]>(url);
  }



}

