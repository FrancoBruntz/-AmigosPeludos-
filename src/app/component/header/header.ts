import { routes } from './../../app.routes';
import { Component, inject, OnInit, computed, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { NotificacionService } from '../../services/notificacionservice';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header  {
  private notifService = inject(NotificacionService);
  private userService = inject(UserService);

  unread = this.notifService.unreadCount;

  constructor(
    protected auth:AuthService, 
    private router:Router){
       effect(() => {
      const user = this.userService.getUser();
      if (user?.dni) {
        this.notifService.cargarPorUsuario(user.dni);
      }
    });
    }


  logout(){
    if(confirm("Seguro que desea cerrar sesion?")){
      this.auth.logOut();
      this.router.navigateByUrl("/home")
    }
    
  }
}
