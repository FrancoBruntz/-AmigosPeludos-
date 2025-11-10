import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Pets from '../../models/pets';
import { ActivatedRoute, Router } from '@angular/router';
import { Petsservice } from '../../services/petsservice';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})

export class Form implements OnInit{
  petForm!: FormGroup;
  petId?: string;

  public types = ['Perro', 'Gato'];
  public sizes = ['Pequeño', 'Mediano', 'Grande'];

  constructor(
    private fb: FormBuilder,
    private PetsSerive: Petsservice,
    private router: Router,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.petForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(25)]],
      size: ['', [Validators.required]],
      color: ['', Validators.required],
      castrado: [false],
      notes: ['', [Validators.maxLength(100)]]
    })

    this.petId = this.route.snapshot.params['id'];
    if(this.petId){
      this.PetsSerive.getPetByID(this.petId).subscribe({
        next: (data) => {this.petForm.patchValue(data)},
        error: (e) => {alert("Algo salio mal" + e)}
      })
    }
  }

  onSubmit(){
    if(this.petForm.invalid){
      alert("La informacion debe estar completa para ser enviada");
      return;
    }

    if(this.petId){
      // modo edicion
      const petEdit: Pets = {id: this.petId, ...this.petForm.value};

      this.PetsSerive.updatePet(petEdit).subscribe({
        next: () => {this.router.navigate(['/sobreellos'])},
        error: (e) => {alert("Algo salio mal" + e)}
      })
    } else {
      // agregar-POST
      const petNew = this.petForm.value;
      this.PetsSerive.addPet(petNew).subscribe({
        next: () => {
          alert("Animalito cargado correctamente");
          this.router.navigate(['/sobreellos']);
        }, 
        error: (e) => {alert("Algo salio mal" + e)}
      })
    }
  }
}