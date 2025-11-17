import { Component, OnInit, inject, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Comentarios from '../../models/comentarios';
import { Comentarioservice } from '../../services/comentarioservice';
import { AuthService } from '../../auth/auth-service';
import { toSignal } from '@angular/core/rxjs-interop';

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
  protected auth= inject(AuthService);
  protected readonly comentariosSource= toSignal(this.comentarioService.getComent());
  protected readonly comentariosSignal = linkedSignal(()=> this.comentariosSource())

  comentarioForm!: FormGroup;

  ngOnInit(): void {
    this.comentarioForm = this.fb.group({
      nombre: ['', Validators.required],
      text: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  borrarComentario(id:string){
    if(confirm("Estas seguro que deseas eliminar el comentario?")){
      this.comentarioService.deleteComent(id).subscribe({
      next:()=>{
        this.comentariosSignal.update(()=>this.comentariosSignal()!.filter((c)=>c.id!=id))
      }
    })
    }
  }

  onSubmit() {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    const nuevoComent: Comentarios = {
      id: Date.now().toString(), // id simple para JSON-server
      nombre: this.comentarioForm.value.nombre,
      text: this.comentarioForm.value.text,
    };

    this.comentarioService.addCment(nuevoComent).subscribe({
      next: (comentGuardado) => {
        this.comentariosSignal.update(()=> [nuevoComent,...this.comentariosSignal()!])
        this.comentarioForm.reset();
      },
      error: (e) => {
        alert('No se pudo guardar el comentario: ' + e);
      },
    });
  }
}

