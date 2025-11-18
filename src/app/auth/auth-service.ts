import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import usuarios from '../models/user';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';
import { UserService } from '../component/user/user.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = environment.urlUser;
  
  constructor(private http: HttpClient, private router: Router, private userService: UserService){}

  public readonly isLogIn=signal(JSON.parse(localStorage.getItem('isLogIn') ?? 'false'));
  public readonly isAdmin=signal(JSON.parse(localStorage.getItem('isLogIn') ?? 'false'));

    logIn(user: string, password:string){

      const requestParams = {
        user: user,
        password: password
      }
  
      let params = new HttpParams({fromObject:requestParams}); 
    
      
      this.http.get<usuarios[]>(this.url,{params:params}).subscribe({//a que corresponde el parametro, el objeto que yo le paso
          next:(data)=>{
            console.log(data);
            if(data[0]){
            // Guardar en UserService para sincronizar con notificaciones
            this.userService.saveCurrent({
              id: data[0].id,
              dni: data[0].user,
              nombre: data[0].nombre ?? '',
              apellido: data[0].apellido ?? '',
              email: data[0].email ?? '',
              telefono: data[0].telefono ?? '',
              direccion: data[0].direccion ?? '',
              isAdmin: data[0].isAdmin



            /*this.userService.saveCurrent({
            id: data[0].id,       // ← AQUÍ SE AGREGA
            dni: data[0].user,
            nombre: '',
            apellido: '',
            email: '',
            telefono: '', 
            direccion: '',
            isAdmin: data[0].isAdmin*/
});
            // 👉 Ahora traemos el perfil completo
            /*this.userService.loadUserProfile(data[0].id);*/
            
            localStorage.setItem("user", data[0].user)
            localStorage.setItem("isLogIn",JSON.stringify(true)); //pasa el booleano a un string
            this.isLogIn.set(true); //para asi cuando recarga la pagina no te lo convierte nuevamente a false
            localStorage.setItem("isAdmin",JSON.stringify(data[0].isAdmin)) //y te saca, si no que, si se recarga la pagina no te saca de la sesion 
            this.isAdmin.update(value=> data[0].isAdmin);
            alert("Incio de sesion con exito!");
            this.router.navigateByUrl("/home");

            } else{
              alert("Usuario o contra incorrecta");
            }
          },
          error:(e)=>{alert("Usuario o contra incorrecta")
            console.error(e)
          }
      });
    }

    logOut(){
      this.isLogIn.set(false);
      this.isAdmin.set(false);
      this.userService.logout();
      localStorage.removeItem("user")
    }

    registro(dni:string, password:string){
      const user={user:dni, password:password, isAdmin:false}
            
      if(this.verificarDNIUnico(dni)){
      this.http.post<usuarios>(this.url, user).subscribe({
        next:(data)=>{
          alert("Registro exitoso");
          this.logIn(dni, password);
        },
        error:(e)=>{alert("Ocurrio un error")}
      }) 
    } else{
      alert("DNI Ya registrado en el sistema");
    }

  }
      

  getCurrentUsername(): string | null {
     return localStorage.getItem('user');
  }

  verificarDNIUnico(dni:string):boolean{

    const requestParams = {
        dni:dni
      }
  
      let params = new HttpParams({fromObject:requestParams}); 
     
    this.http.get<usuarios[]>(this.url,{params:params}).subscribe({
      next: (data)=> {
        console.log(data);
        if(data[0]){
          return true;
        }
        return false;
      }
    })

    return false;
  }
  updateUser(id: string, data: Partial<usuarios>) {
  return this.http.patch<usuarios>(`${this.url}/${id}`, data);
}
}
