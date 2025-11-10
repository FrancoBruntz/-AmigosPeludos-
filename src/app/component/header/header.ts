import { routes } from './../../app.routes';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(protected auth:AuthService, private router:Router){}

  logout(){
    this.auth.logOut();
    this.router.navigateByUrl("/home")
  }
}
