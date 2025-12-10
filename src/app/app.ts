import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./component/header/header";
import { Footer } from "./component/footer/footer";

// 🔥 IMPORTS NECESARIOS PARA ANGULAR MATERIAL DIALOG
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// 🔥 IMPORTAR TU COMPONENTE DE CONFIRMACIÓN
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';

import { NotificacionService } from './services/notificacionservice';

@Component({
  selector: 'app-root',

  // 👇 AGREGAMOS TODOS LOS IMPORTS NECESARIOS
  imports: [
    RouterOutlet,
    Header,
    Footer,
    MatDialogModule,
    MatButtonModule,
    //ConfirmDialogComponent    
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('amigospeludos');

  notification = inject(NotificacionService);
}
