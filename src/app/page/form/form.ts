import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import Pets from '../../models/pets';
import { Petsservice } from '../../services/petsservice';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {
  petForm!: FormGroup;
  petId?: string;

  public types = ['Perro', 'Gato'];
  public sizes = ['Pequeño', 'Mediano', 'Grande'];
  public sexo = ['Macho', 'Hembra'];

  // imágenes
  file: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isHovering = false;
  isUploading = false;

  // configuración de CLOUDINARY 
  readonly CLOUD_NAME = 'dc7ucvbtu';
  readonly UPLOAD_PRESET = 'imgpets';

  constructor(
    private fb: FormBuilder,
    private petsService: Petsservice,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.petForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(25)]],
      ageUnit: ['', Validators.required],
      size: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      color: ['', Validators.required],
      castrado: [false],                      
      notes: ['', [Validators.maxLength(100)]],
      image: ['', Validators.required],       
      activo: [true]
    });

    this.petId = this.route.snapshot.params['id'];

    if (this.petId) {
      this.petsService.getPetByID(this.petId).subscribe({
        next: (data: Pets) => {
          this.petForm.patchValue(data);
          if (data.image) {
            this.imagePreview = data.image; // para ver la imagen guardada en edición
          }
        },
        error: (e) => {
          alert('Algo salió mal ' + e);
        },
      });
    }
  }

  // ======= Drag & Drop imagen =======
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isHovering = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isHovering = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isHovering = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    this.file = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;

      // Marcamos el formControl image como con valor para que pase el required
      this.petForm.patchValue({ image: 'temp-local-file' });
      const imageControl = this.petForm.get('image');
      imageControl?.markAsDirty();
      imageControl?.markAsTouched();
      imageControl?.updateValueAndValidity();
    };
    reader.readAsDataURL(file);
  }

  clearImage() {
    this.file = null;
    this.imagePreview = null;
    this.petForm.patchValue({ image: '' });
    const imageControl = this.petForm.get('image');
    imageControl?.markAsDirty();
    imageControl?.markAsTouched();
    imageControl?.updateValueAndValidity();
  }

  // ======= Reset completo (form + imagen) =======
  onReset() {
    // Resetea el formulario a sus valores iniciales
    this.petForm.reset({
      name: '',
      type: '',
      age: '',
      ageUnit: '',
      size: '',
      sexo: '',
      color: '',
      castrado: false,
      notes: '',
      image: '',
      activo: true
    });

    // Limpia imagen y estados relacionados
    this.clearImage();
    this.isHovering = false;

    // Deja el form como recién cargado
    this.petForm.markAsPristine();
    this.petForm.markAsUntouched();
    this.petForm.updateValueAndValidity();
  }

  // ======= Subida a Cloudinary =======
  async uploadToCloudinary(): Promise<string | null> {
    if (!this.file) return null;

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('upload_preset', this.UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url as string;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }

  // ======= Submit =======
  async onSubmit() {
    // Si el formulario es inválido, marco TODOS los controles como tocados + sucios
    if (this.petForm.invalid) {
      Object.keys(this.petForm.controls).forEach(key => {
        const control = this.petForm.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
        control?.updateValueAndValidity();
      });

      alert('La información debe estar completa y correcta para ser enviada');
      return;
    }

    this.isUploading = true;

    try {
      // Si hay imagen nueva, la subo y guardo la URL en el form
      if (this.file) {
        const imageUrl = await this.uploadToCloudinary();
        if (imageUrl) {
          this.petForm.patchValue({ image: imageUrl });
          this.petForm.get('image')?.updateValueAndValidity();
        }
      }

      if (this.petId) {
        // MODO EDICIÓN
        const petEdit: Pets = { id: this.petId, ...this.petForm.value };

        this.petsService.updatePet(petEdit).subscribe({
          next: () => {
            this.isUploading = false;
            this.router.navigate(['/sobreellos']);
          },
          error: (e) => {
            this.isUploading = false;
            alert('Algo salió mal: ' + e);
          },
        });
      } else {
        // MODO ALTA
        const petNew = this.petForm.value;
        this.petsService.addPet(petNew).subscribe({
          next: () => {
            this.isUploading = false;
            alert('Animalito cargado correctamente');
            this.router.navigate(['/sobreellos']);
          },
          error: (e) => {
            this.isUploading = false;
            alert('Algo salió mal: ' + e);
          },
        });
      }
    } catch (error) {
      this.isUploading = false;
      alert('Error al subir la imagen. Intente nuevamente.');
    }
  }
}

