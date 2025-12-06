import { Component, OnInit } from '@angular/core';
import Pets from '../../models/pets';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Petsservice } from '../../services/petsservice';
import { AuthService } from '../../auth/auth-service';
import { Location, DatePipe } from '@angular/common';
import { Solicitudesservice } from '../../services/solicitudesservice';
import Solicitud from '../../models/solicitud';
import { UserService, UserProfile } from '../../component/user/user.service';

@Component({
  selector: 'app-details',
  imports: [RouterLink],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details implements OnInit {

  pets?: Pets;
  solicitudAprobada?: Solicitud;
  adoptante?: UserProfile;

  constructor(
    private petsService: Petsservice,
    private solicitudesService: Solicitudesservice,
    private userService: UserService,
    private route: ActivatedRoute,
    protected auth: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.petsService.getPetByID(id).subscribe({
      next: (data) => {
        this.pets = data;

        // Si está adoptado, cargar datos de adopción
        if (data.activo === false) {
          this.cargarDatosDeAdopcion(data.id);
        }
      },
      error: (e) => alert('Algo salió mal: ' + e),
    });
  }

  private cargarDatosDeAdopcion(animalId: string) {
    this.solicitudesService.getApprovedRequestForAnimal(animalId).subscribe({
      next: (solicitudes) => {
        if (!solicitudes || solicitudes.length === 0) return;

        this.solicitudAprobada = solicitudes[0];

        const dni = String(this.solicitudAprobada.solicitanteUser).trim();

        this.userService.getByDni(dni).subscribe({
          next: (users) => {
            this.adoptante = Array.isArray(users) ? users[0] : users;
          },
        });
      },
    });
  }

  borrarPets(id: string) {
    if (!this.pets?.id) return;
    if (!confirm('¿Está seguro de eliminar el animal?')) return;

    this.petsService.deletePet(id).subscribe({
      next: () => alert('Eliminado con éxito'),
      error: (e) => alert('Error al eliminar: ' + e),
    });
  }

  goBack() {
    this.location.back();
  }
}
