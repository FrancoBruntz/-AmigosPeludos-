import { Component, OnInit, inject } from '@angular/core';
import Pets from '../../models/pets';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Petsservice } from '../../services/petsservice';
import { AuthService } from '../../auth/auth-service';
import { Location } from '@angular/common';
import { Solicitudesservice } from '../../services/solicitudesservice';
import Solicitud from '../../models/solicitud';
import { UserService, UserProfile } from '../../component/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

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

  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

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

        if (data.activo === false) {
          this.cargarDatosDeAdopcion(data.id);
        }
      },
      error: () => {
        this.snack.open('Error al cargar el animal', 'Cerrar', { duration: 3000 });
      },
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

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Está seguro de eliminar el animal?' }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.petsService.deletePet(id).subscribe({
        next: () => {
          this.snack.open('Eliminado con éxito', 'OK', { duration: 3000 });
          this.location.back();
        },
        error: () => {
          this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        },
      });
    });
  }

  goBack() {
    this.location.back();
  }
}
