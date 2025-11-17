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
<<<<<<< HEAD
   pets = signal<Pets[]>([]);
  allPets: Pets[] = [];   // respaldo para filtrar
=======
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


>>>>>>> dbd12e194da82f1978e7b9c40bdb75b949e87a0e
  protected showOnlyAvailable = false;

  filterType: string = 'Todos'; // 🐶🐱 TODOS / PERRO / GATO

  constructor(
    private listaPets: Petsservice,
    private router: Router,
    protected auth: AuthService
  ) {}

  ngOnInit() {
    this.loadActivePets();
  }

  loadActivePets() {
    this.listaPets.getPetActivos().subscribe({
      next: (data) => {
        this.allPets = data;
        this.applyTypeFilter();
      },
      error: (e) => alert("Algo salió mal: " + e)
    });
  }

  loadInactivePets() {
    this.listaPets.getPetInactives().subscribe({
      next: (data) => {
        this.allPets = data;
        this.applyTypeFilter();
      },
      error: (e) => alert("Algo salió mal: " + e)
    });
  }

  // 🐾 Toggle historial (solo admin)
  onToggle(checked: boolean) {
    this.showOnlyAvailable = checked;
    checked ? this.loadInactivePets() : this.loadActivePets();
  }

  // 🐕🐈 Filtrar por tipo
  applyTypeFilter() {
    if (this.filterType === 'Todos') {
      this.pets.set([...this.allPets]);
    } else {
      this.pets.set(
        this.allPets.filter(p => p.type?.toLowerCase() === this.filterType.toLowerCase())
      );
    }
  }

  // 🗑 Eliminar
  eliminarPet(id: string) {
    if (confirm("¿Desea eliminar este animal?")) {
      this.listaPets.deletePet(id).subscribe({
        next: () => {
          this.showOnlyAvailable ? this.loadInactivePets() : this.loadActivePets();
          this.router.navigateByUrl("/sobreellos");
        },
        error: (e) => alert("Algo salió mal: " + e)
      });
    }
  }

  agregarFavorito(pet: Pets) {
  this.favoriteService.addFavorite(pet);
  alert(pet.name + " fue agregado a favoritos 🩷");
}

}
