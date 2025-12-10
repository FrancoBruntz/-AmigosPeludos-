import { Component, OnInit, inject, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Comentarios from '../../models/comentarios';
import { Comentarioservice } from '../../services/comentarioservice';
import { AuthService } from '../../auth/auth-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-comentario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comentarios.html',
  styleUrl: './comentarios.css',
})
export class Comentario implements OnInit {

  private fb = inject(FormBuilder);
  private comentarioService = inject(Comentarioservice);
  protected auth = inject(AuthService);

  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected readonly comentariosSource = toSignal(this.comentarioService.getComent());
  protected readonly comentariosSignal = linkedSignal(() => this.comentariosSource());

  comentarioForm!: FormGroup;

  ngOnInit(): void {
    this.comentarioForm = this.fb.group({
      nombre: ['', Validators.required],
      text: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  borrarComentario(id: string) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        mensaje: '¿Estás seguro que deseas eliminar este comentario?'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) {
        this.snack.open('Eliminación cancelada', 'OK', { duration: 2000 });
        return;
      }

      this.comentarioService.deleteComent(id).subscribe({
        next: () => {
          this.comentariosSignal.update(() =>
            this.comentariosSignal()!.filter(c => c.id !== id)
          );

          this.snack.open(
            'Comentario eliminado correctamente',
            'OK',
            { duration: 3000 }
          );
        },
        error: () => {
          this.snack.open(
            'No se pudo eliminar el comentario',
            'Cerrar',
            { duration: 3500 }
          );
        }
      });
    });
  }

  onSubmit() {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();

      this.snack.open(
        'Completá correctamente el formulario',
        'OK',
        { duration: 2500 }
      );
      return;
    }

    const nuevoComent: Comentarios = {
      id: Date.now().toString(),
      nombre: this.comentarioForm.value.nombre,
      text: this.comentarioForm.value.text,
    };

    this.comentarioService.addCment(nuevoComent).subscribe({
      next: () => {
        this.comentariosSignal.update(() => [
          nuevoComent,
          ...this.comentariosSignal()!
        ]);

        this.comentarioForm.reset();

        this.snack.open(
          'Comentario enviado correctamente',
          'OK',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snack.open(
          'No se pudo guardar el comentario',
          'Cerrar',
          { duration: 3500 }
        );
      },
    });
  }
}
