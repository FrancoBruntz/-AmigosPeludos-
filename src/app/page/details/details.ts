import { Component, OnInit } from '@angular/core';
import Pets from '../../models/pets';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Petsservice } from '../../services/petsservice';

@Component({
  selector: 'app-details',
  imports: [RouterLink],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details implements OnInit{

  pets?: Pets;

  constructor(private petsService: Petsservice,
              private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.petsService.getPetByID(id).subscribe({
      next:(data)=>{
        this.pets = data
      },
      error:(e)=>{
        alert("Algo salio mal" +e)
      }
    })
  }  

  borrarPets(id: string){
    if(!this.pets?.id)return;
    if(!confirm('Esta seguro de eliminar el animal?')) return;

    this.petsService.deletePet(id).subscribe({
      next:(data)=>{
      this.petsService.getPet(); 
      alert("Eliminado con exito");
      },
      error:(e)=>{
        alert("Algo salio mal, no se pudo eliminar" +e)
      }
    })
  }

}
