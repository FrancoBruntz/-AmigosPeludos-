import { Component, OnInit } from '@angular/core';
import Solicitud from '../../../models/solicitud';
import { DatePipe } from '@angular/common';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-request-details',
  imports: [DatePipe, RouterLink],
  templateUrl: './request-details.html',
  styleUrl: './request-details.css',
})
export class RequestDetails implements OnInit {
  solicitud ?: Solicitud;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudesServ: Solicitudesservice
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'No se encontró el identificador de la solicitud.';
      this.isLoading = false;
      return;
    }

    this.solicitudesServ.getById(id).subscribe({
      next: (data) => {
        this.solicitud= data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se encontró la solicitud.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/solicitudes']);
  }

  // Helpers para mostrar Sí/No
  boolToText(value: boolean | undefined): string {
    return value ? 'Sí' : 'No';
  }

  viviendaLabel(tipo: 'casa' | 'departamento'): string {
    return tipo === 'casa' ? 'Casa' : 'Departamento';
  }
}
