import { Component, OnInit, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Pets from '../../models/pets';
import { Petsservice } from '../../services/petsservice';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-list',
  imports: [ RouterLink,FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit{
  pets= signal <Pets[]>([]);

  constructor(private listaPets: Petsservice, private router: Router, protected auth:AuthService){};

  ngOnInit() {
   this.cargarPet();
  }

  cargarPet(){
    this.listaPets.getPet().subscribe({
      next: (data) => {
        this.pets.update(pets => [...data]);
      },
      error:(e) =>{
        alert("Algo salio mal" + e);
      }
    })
  }

  eliminarPet(id: string){
    if(confirm("Desea eliminar este animal?")){
     this.listaPets.deletePet(id).subscribe({
      next: ()=>{
        this.cargarPet();
        this.router.navigateByUrl("/sobreellos");
      },
      error:(e)=>{
        alert("Algo salio mal" + e);
      }
    }) 
    }  
  } 


  protected showOnlyAvailable = false;

  // Se llama cuando cambia el toggle
  onToggle(checked: boolean) {
    if (checked) {
      this.filteredPets();
    } else {
      this.cargarPet();
    }
  }

  filteredPets() {
     this.listaPets.getPetInactives().subscribe({
      next: (data) => {
        this.pets.update(pets => [...data]);
      },
      error:(e) =>{
        alert("Algo salio mal" + e);
      }
    })
  }
}
