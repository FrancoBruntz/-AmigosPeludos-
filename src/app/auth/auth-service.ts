import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import usuarios from '../models/user';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = environment.urlUser;
  
  constructor(private http: HttpClient, private router: Router){}

  public readonly isLogIn=signal(false);
  public readonly isAdmin=signal(false);

    logIn(user: string, password:string){

      const requestParams = {
        user: user,
        password: password
      }
  
      let params = new HttpParams({fromObject:requestParams}); 
    
      
      this.http.get<usuarios[]>(this.url,{params:params}).subscribe({//a que corresponde el parametro, el objeto que yo le paso
          next:(data)=>{
            console.log(data);
            if(data[0].user){
            localStorage.setItem("user", data[0].user)
            this.isLogIn.set(true);
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
      localStorage.removeItem("user")
    }

    registro(dni:string, password:string){
      const user={user:dni, password:password, isAdmin:false}
            
      this.http.post<usuarios>(this.url, user).subscribe({
        next:(data)=>{
          alert("Registro exitoso");
          this.logIn(dni, password);
        },
        error:(e)=>{alert("Ocurrio un error")}
      }) 
    }

    getCurrentUsername(): string | null {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null')?.user ?? null;
      }
      catch { return null ;}
    }

}
