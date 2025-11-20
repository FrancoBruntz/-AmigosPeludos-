import { routes } from './../../app.routes';
import { Component, inject, OnInit } from '@angular/core';
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
export class Header implements OnInit {
  private notifService = inject(NotificacionService);
  private userService = inject(UserService);

  unread = 0;

  constructor(
    protected auth:AuthService, 
    private router:Router){}

  ngOnInit(): void {
    // Suscribirse a cambios de usuario para actualizar badge
    const dni = this.userService.getUser()?.dni;
    if (dni) {
      this.notifService.listByUser(dni).subscribe({
        next: (list) => this.unread = list.filter(n => !n.leida).length,
        error: () => this.unread = 0
      });
    }
  }

  logout(){
    if(confirm("Seguro que desea cerrar sesion?")){
      this.auth.logOut();
      this.router.navigateByUrl("/home")
    }
    
  }
}
