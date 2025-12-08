import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService, UserProfile } from '../../../component/user/user.service';

@Component({
  selector: 'app-admin-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-user-profile.html',
  styleUrl: './admin-user-profile.css',
})
export class AdminUserProfile implements OnInit {

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  loading = true;
  error = '';
  profile?: UserProfile;

  ngOnInit(): void {
    const dni = this.route.snapshot.paramMap.get('dni');

    if (!dni) {
      this.error = 'No se recibió el DNI del solicitante.';
      this.loading = false;
      return;
    }

    // Usa el getByDni que ya tenés en UserService
    this.userService.getByDni(dni).subscribe({
      next: (users) => {
        if (!users || users.length === 0) {
          this.error = 'No se encontró un usuario con ese DNI.';
        } else {
          // en JSON server viene como array
          this.profile = users[0];
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el perfil del solicitante.';
        this.loading = false;
      }
    });
  }
}