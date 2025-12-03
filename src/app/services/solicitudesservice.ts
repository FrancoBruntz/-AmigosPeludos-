import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Solicitud, { EstadoSolicitud, TipoVivienda } from '../models/solicitud';

@Injectable({
  providedIn: 'root',
})
export class Solicitudesservice {
  
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/solicitudes';

  // Tipo auxiliar para los datos extra del formulario
  private buildBody(
    animalId: string,
    dni: string,
    mensaje: string | undefined,
    extraDatos: {
      tipoVivienda: TipoVivienda;
      tienePatio: boolean;
      tieneMascotas: boolean;
      detalleMascotas?: string;
      viveConNinos: boolean;
      aceptaCompromiso: boolean;
    }
  ): Omit<Solicitud, 'id'> {
    return {
      animalId,
      solicitanteUser: dni,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      mensaje,

      tipoVivienda: extraDatos.tipoVivienda,
      tienePatio: extraDatos.tienePatio,
      tieneMascotas: extraDatos.tieneMascotas,
      detalleMascotas: extraDatos.detalleMascotas,
      viveConNinos: extraDatos.viveConNinos,
      aceptaCompromiso: extraDatos.aceptaCompromiso
    };
  }

  getById(id: string) {
    return this.http.get<Solicitud>(`${this.base}/${id}`);
  }

  // Trae todas las solicitudes de un usuario (por dni como clave)
  listByUser(dni: string){
    return this.http.get<Solicitud[]>(
      `${this.base}?solicitanteUser=${encodeURIComponent(dni)}`
    );
  }

  // Crear solicitud nueva para un animal dado y un user
  create(
    animalId: string,
    dni: string,
    mensaje: string | undefined,
    extraDatos: {
      tipoVivienda: TipoVivienda;
      tienePatio: boolean;
      tieneMascotas: boolean;
      detalleMascotas?: string;
      viveConNinos: boolean;
      aceptaCompromiso: boolean;
    }
  ) {
    const body = this.buildBody(animalId, dni, mensaje, extraDatos);
    return this.http.post<Solicitud>(this.base, body);
  }

  // Consultar si el usuario ya tiene solicitudes (cualquier estado) para ese animal
  fetchUserRequestForAnimal(animalId: string, dni: string){
    return this.http.get<Solicitud[]>(
      `${this.base}?animalId=${encodeURIComponent(animalId)}&solicitanteUser=${encodeURIComponent(dni)}`
    );
  }

  // Moderar solicitud (para Admin)
  cambiarEstado(id: string, estado: EstadoSolicitud, comentarios?: string) {
    return this.http.patch<Solicitud>(`${this.base}/${id}`, {estado, comentarios}); 
  }

  listAll() {
    return this.http.get<Solicitud[]>(this.base);
  }

  // Eliminar/Cancelar una solicitud por id
  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  list(params: {dni?: string; estado?: EstadoSolicitud} ) {
    
    const q: string[] = [];

    if (params.dni){
      q.push(`solicitanteUser=${encodeURIComponent(params.dni)}`);
    }
    if (params.estado) {
      q.push(`estado=${encodeURIComponent(params.estado)}`);
    }

    const url = q.length ? `${this.base}?${q.join('&')}` : this.base;

    return this.http.get<Solicitud[]>(url);
  } 

  // Traer la solicitud aprobada de un animal, para el historial.
  getApprovedRequestForAnimal(animalId: string) {
    return this.http.get<Solicitud[]>(
      `${this.base}?animalId=${encodeURIComponent(animalId)}&estado=aprobada`
    );
  }

}
