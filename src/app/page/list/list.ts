import { Component, OnInit, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Pets from '../../models/pets';
import { Petsservice } from '../../services/petsservice';
import { AuthService } from '../../auth/auth-service';
import { FavoriteService } from '../../services/favorite.service';


@Component({
  selector: 'app-list',
  imports: [ RouterLink,FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit{
  pets= signal <Pets[]>([]);

  constructor(private listaPets: Petsservice, private router: Router, protected auth:AuthService, private favoriteService: FavoriteService){};

  ngOnInit() {
   // Por defecto cargar solo animales activos (disponibles)
   this.listaPets.getPetActivos().subscribe({
     next: (data) => {
       this.pets.set([...data]);
     },
     error:(e) =>{
       alert("Algo salio mal" + e);
     }
   });
  }

  cargarPet(){
    this.listaPets.getPetActivos().subscribe({
      next: (data) => {
        this.pets.set([...data]);
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
    this.showOnlyAvailable = checked;
    if (checked) {
      this.filteredPets();
    } else {
      this.cargarPet();
    }
  }

  filteredPets() {
     // Mostrar todos los animales inactivos (adoptados)
     this.listaPets.getPetInactives().subscribe({
      next: (data) => {
        console.log('Animales inactivos:', data);
        this.pets.set([...data]);
      },
      error:(e) =>{
        alert("Algo salio mal" + e);
      }
    })
  }

  agregarFavorito(pet: Pets) {
  this.favoriteService.addFavorite(pet);
  alert(pet.name + " fue agregado a favoritos 🩷");
}

}
