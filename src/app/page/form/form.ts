import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import Pets from '../../models/pets';
import { Petsservice } from '../../services/petsservice';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
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

  file: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isHovering = false;
  isUploading = false;

  readonly CLOUD_NAME = 'dc7ucvbtu';
  readonly UPLOAD_PRESET = 'imgpets';

  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

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
          if (data.image) this.imagePreview = data.image;
        },
        error: () => {
          this.snack.open('Error al cargar el animal', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isHovering = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;
    const files = event.dataTransfer?.files;
    if (files?.length) this.handleFile(files[0]);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  handleFile(file: File) {
    this.file = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.petForm.patchValue({ image: 'temp' });
      this.petForm.get('image')?.updateValueAndValidity();
    };
    reader.readAsDataURL(file);
  }

  clearImage() {
    this.file = null;
    this.imagePreview = null;
    this.petForm.patchValue({ image: '' });
    this.petForm.get('image')?.updateValueAndValidity();
  }

  onReset() {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Seguro que querés limpiar el formulario?' }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;

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

      this.clearImage();
      this.isHovering = false;

      this.snack.open('Formulario limpiado', 'OK', { duration: 2500 });
    });
  }

  async uploadToCloudinary(): Promise<string | null> {
    if (!this.file) return null;

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('upload_preset', this.UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url;
  }

  async onSubmit() {
    if (this.petForm.invalid) {
      Object.keys(this.petForm.controls).forEach(key => {
        const c = this.petForm.get(key);
        c?.markAsTouched();
        c?.markAsDirty();
      });

      this.snack.open('Completá correctamente el formulario', 'Cerrar', { duration: 3000 });
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: this.petId ? '¿Confirmar cambios?' : '¿Confirmar creación del animal?' }
    });

    ref.afterClosed().subscribe(async confirm => {
      if (!confirm) return;

      this.isUploading = true;

      try {
        if (this.file) {
          const imageUrl = await this.uploadToCloudinary();
          if (imageUrl) this.petForm.patchValue({ image: imageUrl });
        }

        if (this.petId) {
          const petEdit: Pets = { id: this.petId, ...this.petForm.value };

          this.petsService.updatePet(petEdit).subscribe({
            next: () => {
              this.isUploading = false;
              this.snack.open('Animal editado correctamente', 'OK', { duration: 3000 });
              this.router.navigate(['/sobreellos']);
            },
            error: () => {
              this.isUploading = false;
              this.snack.open('Error al editar', 'Cerrar', { duration: 3000 });
            },
          });
        } else {
          this.petsService.addPet(this.petForm.value).subscribe({
            next: () => {
              this.isUploading = false;
              this.snack.open('Animal cargado correctamente', 'OK', { duration: 3000 });
              this.router.navigate(['/sobreellos']);
            },
            error: () => {
              this.isUploading = false;
              this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 });
            },
          });
        }
      } catch {
        this.isUploading = false;
        this.snack.open('Error al subir imagen', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
