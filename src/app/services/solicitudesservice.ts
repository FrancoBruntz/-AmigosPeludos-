import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import Solicitud, { EstadoSolicitud } from '../models/solicitud';


@Injectable({
  providedIn: 'root',
})
export class Solicitudesservice {
  
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/solicitudes';

  // Trae todas las solicitudes de un usuario (por username como clave)
  listByUser(username: string){
    return this.http.get<Solicitud[]>(
      `${this.base}?solicitanteUser=${encodeURIComponent(username)}}` // encodeURIComponent() asegura que la URL no se rompa con espacio/acentos
    );
  }

  // Crear solicitud nueva para un animal dado y un username
  create(animalId: string, username: string) {
    const body: Omit<Solicitud, 'id'> = {
      animalId,
      solicitanteUSer: username,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };
    return this.http.post<Solicitud>(this.base, body as any);
  }

  // Consultar si el usuario ya tiene solicitudes (cualquier estado) para ese animal
  fetchUserRequestForAnimal(animalId: string, username: string){
    return this.http.get<Solicitud[]>(
      `${this.base}?animalId=${encodeURIComponent(animalId)}&solicitanteUser=${encodeURIComponent(username)}`
    );
  }

  // Moderar solicitud (para Admin)
  cambiarEstado(id: string, estado: EstadoSolicitud, comentarios?: string) {
    return this.http.patch<Solicitud>(`${this.base}/${id}`, {estado, comentarios}); 
    // patch: actualizacion parcial (solo 'estado' y 'comentarios'), no reemplaza todo el recurso
  }


}
