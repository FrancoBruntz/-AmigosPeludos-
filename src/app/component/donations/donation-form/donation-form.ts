import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Donationsservice } from '../../../services/donationsservice';
import { Donation } from '../../../models/donation';
import { AuthService } from '../../../auth/auth-service';
import axios from 'axios';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-donation-form',
  standalone: true,
  imports: [ReactiveFormsModule, ɵInternalFormsSharedModule, CurrencyPipe, TitleCasePipe],
  templateUrl: './donation-form.html',
  styleUrls: ['./donation-form.css'],
})
export class DonationForm implements OnInit {

  form!: FormGroup;

  methods = ['Tarjeta', 'Transferencia'];

  readonly transferAlias = 'animales.peludos.refugio';
  readonly transferCbu = '0000003100045678912345';

  file: File | null = null;
  comprobantePreview: string | null = null;
  isUploading = false;
  isHovering = false;

  readonly CLOUD_NAME = 'dwynrzhcx';
  readonly UPLOAD_PRESET = 'imgdonations';

  constructor(
    private fb: FormBuilder,
    private donationsServ: Donationsservice,
    private router: Router,
    private authService: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLogIn()) {
      this.snack.open('Debés iniciar sesión para donar.', 'Cerrar', { duration: 3500 });
      this.router.navigate(['/login']);
      return;
    }

    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1000)]],
      method: ['', [Validators.required]],
      message: ['', [Validators.maxLength(200)]],

      cardNumber: [''],
      cardHolder: [''],
      expiration: [''],
      cvv: [''],

      alias: [this.transferAlias],
      cbu: [this.transferCbu],
      comprobanteUrl: [''],
    });

    this.form.get('method')?.valueChanges.subscribe((method) => {
      this.configureValidatorsForMethod(method);
    });

    this.configureValidatorsForMethod(this.form.get('method')?.value);
  }

  isCardMethod(): boolean {
    return this.form.get('method')?.value === 'Tarjeta';
  }

  isTransferMethod(): boolean {
    return this.form.get('method')?.value === 'Transferencia';
  }

  getControl(name: string) {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.touched && control.invalid);
  }

  hasError(name: string, error: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.touched && control.hasError(error));
  }

  private configureValidatorsForMethod(method: string | null | undefined) {
    const cardNumber = this.form.get('cardNumber');
    const cardHolder = this.form.get('cardHolder');
    const expiration = this.form.get('expiration');
    const cvv = this.form.get('cvv');
    const comprobanteUrl = this.form.get('comprobanteUrl');

    if (method === 'Tarjeta') {
      cardNumber?.setValidators([
        Validators.required,
        Validators.minLength(13),
        Validators.maxLength(19),
        Validators.pattern(/^\d{13,19}$/),
      ]);

      cardHolder?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)$/)
      ]);

      expiration?.setValidators([
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
      ]);

      cvv?.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(3),
        Validators.pattern(/^\d{3}$/),
      ]);

      comprobanteUrl?.clearValidators();

    } else if (method === 'Transferencia') {
      cardNumber?.clearValidators();
      cardHolder?.clearValidators();
      expiration?.clearValidators();
      cvv?.clearValidators();
      comprobanteUrl?.clearValidators();
    }

    cardNumber?.updateValueAndValidity({ emitEvent: false });
    cardHolder?.updateValueAndValidity({ emitEvent: false });
    expiration?.updateValueAndValidity({ emitEvent: false });
    cvv?.updateValueAndValidity({ emitEvent: false });
    comprobanteUrl?.updateValueAndValidity({ emitEvent: false });
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
      this.comprobantePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearComprobante() {
    this.file = null;
    this.comprobantePreview = null;
    this.form.patchValue({ comprobanteUrl: '' });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isHovering = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isHovering = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private async uploadToCloudinary(): Promise<string | null> {
    if (!this.file) return null;

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('upload_preset', this.UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url as string;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Revisá los campos marcados.', 'Cerrar', { duration: 3500 });
      return;
    }

    if (this.isTransferMethod() && !this.file) {
      this.snack.open('Debés adjuntar el comprobante.', 'Cerrar', { duration: 3500 });
      return;
    }

    if (this.isCardMethod()) {
      const cardFieldsValid =
        this.form.get('cardNumber')?.valid &&
        this.form.get('cardHolder')?.valid &&
        this.form.get('expiration')?.valid &&
        this.form.get('cvv')?.valid;

      if (!cardFieldsValid) {
        this.form.get('cardNumber')?.markAsTouched();
        this.form.get('cardHolder')?.markAsTouched();
        this.form.get('expiration')?.markAsTouched();
        this.form.get('cvv')?.markAsTouched();

        this.snack.open('Completá correctamente los datos de la tarjeta.', 'Cerrar', { duration: 3500 });
        return;
      }
    }

    const currentUserId = this.authService.getCurrentUsername();

    if (!currentUserId) {
      this.snack.open('Debés iniciar sesión.', 'Cerrar', { duration: 3500 });
      this.router.navigate(['/login']);
      return;
    }

    this.isUploading = true;

    try {
      if (this.file) {
        const url = await this.uploadToCloudinary();
        if (url) {
          this.form.patchValue({ comprobanteUrl: url });
        }
      }

      const { amount, method, message, comprobanteUrl } = this.form.value;

      const donation: Donation = {
        userId: currentUserId,
        amount,
        method,
        message,
        date: new Date().toISOString(),
        comprobanteUrl,
      };

      this.donationsServ.addDonation(donation).subscribe({
        next: () => {
          this.isUploading = false;
          this.snack.open('Donación confirmada con éxito.', 'Cerrar', { duration: 3500 });
          this.router.navigate(['/mis-donaciones']);
        },
        error: () => {
          this.isUploading = false;
          this.snack.open('Error al registrar la donación.', 'Cerrar', { duration: 3500 });
        },
      });

    } catch (error) {
      this.isUploading = false;
      this.snack.open('Error al subir el comprobante.', 'Cerrar', { duration: 3500 });
    }
  }
}
