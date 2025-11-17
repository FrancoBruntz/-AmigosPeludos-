import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Comentarios from '../models/comentarios';

@Injectable({
  providedIn: 'root',
})
export class Comentarioservice {
  readonly url ="http://localhost:3000/comentarios"

  constructor(private http: HttpClient){}

  getComent(){ 
   return this.http.get<Comentarios[]>(this.url);
  }

  addCment(coment: Comentarios){ 
    return this.http.post<Comentarios>(this.url, coment);
  }

  deleteComent(id:string){ 
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  
}
