import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Pets from '../models/pets';

@Injectable({
  providedIn: 'root',
})
export class Petsservice {
  readonly url ="http://localhost:3000/pets"

  constructor(private http: HttpClient){}

  getPet(){ //devuelve la lista completa de animales (activos e inactivos)
   return this.http.get<Pets[]>(this.url);
  }

  getPetActivos(){ //devuelve solo animales activos (disponibles)
    return this.http.get<Pets[]>(`${this.url}?activo=true`);
  }

  getPetInactives(){ //devuelve la lista completa de animales inactivos (adoptados)
    return this.http.get<Pets[]>(`${this.url}?activo=false`);
  }

  getPetByID(id: string){ //devuelve un animal especifico
    return this.http.get<Pets>(`${this.url}/${id}`);
  }

  addPet(pet: Pets){ //agrega animales a la lista => METODO POST
    return this.http.post<Pets>(this.url, pet);
  }

  updatePet(pet: Pets){ //edita la informacion de un animal en especifico => METODO PUT
    return this.http.put<Pets>(`${this.url}/${pet.id}`, pet);
  }

  deletePet(id:string){ //elimina animal de la lista =>METODO DELETE
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
