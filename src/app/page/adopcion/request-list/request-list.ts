import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Solicitudesservice } from '../../../services/solicitudesservice';
import Solicitud from '../../../models/solicitud';
import { UserService } from '../../../component/user/user.service';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css',
})
export class RequestList implements OnInit {
  private solicitudes = inject(Solicitudesservice);

  private userService = inject(UserService);
  //private auth = inject(AuthService);
  
  // Estado de la vista
  loading = true; // para mosrtar "cargando..." mientras llega la data
  error = '';
  data: Solicitud[] = []; // Arreglo con las solicitudes del usuario

  ngOnInit(): void {
    
    // Leer dni desde el UserService
    const dni  = this.userService.getUser()?.dni ?? null;

    // Si no hay usuario en sesion, informamos y salimos
    if(!dni){
      this.error = 'Inicia sesion para ver tus solicitudes';
      this.loading = false;
      return; // Si no el username del listByUser tira error porque no asegura que no esa null
    }

    // Pedimos al json-server las solicitudes de este usuario
    this.solicitudes.listByUser(dni).subscribe({
      // onNext: guardamos y apagamos el loading
      next: list => { this.data = list; 
        this.loading = false; },

      // onError: mostramos un mensaje y apagamos el loading
      error: _ => { this.error = 'No se pudo cargar'; 
        this.loading = false; }

    });

  }

  // trackBy para *ngFor: optimiza el render reutilizando filas por id
  trackById = (_: number, s: Solicitud) => s.id;

}
