import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UiService } from '../../../core/services/ui';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-modal.html',
  styleUrls: ['./auth-modal.scss']
})
export class AuthModalComponent implements OnInit {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  uiService = inject(UiService);

  isLoginMode = true;
  authForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.successMessage = null;
    this.errorMessage = null;
    if (this.isLoginMode) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    } else {
      this.authForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]],
        acceptTerms: [false, Validators.requiredTrue]
      }, {validators: this.passwordMatchValidator});
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const passwordConfirm = control.get('passwordConfirm')?.value;

    if (password !== passwordConfirm) {
      control.get('passwordConfirm')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.initForm();
  }

  closeModal() {
    this.uiService.closeAuthModal();
  }

  onSubmit() {

    this.successMessage = null;
    this.errorMessage = null;

    if (this.authForm.invalid) return;

    if (this.isLoginMode) {
      this.authService.login(this.authForm.value).subscribe({
        next: () => {
          this.toastService.show('Sikeresen bejelentkeztél!', 'success');
          this.closeModal();
        },
        error: () => this.errorMessage = 'Helytelen email vagy jelszó!'
      });
    } else {
      this.authService.register(this.authForm.value).subscribe({
        next: () => {
          this.isLoginMode = true;
          this.initForm();
          this.successMessage = 'Sikeres regisztráció! Kérlek jelentkezz be.';
        },
        error: (err) => this.errorMessage = err.error?.detail || 'Hiba a regisztráció során.'
      });
    }
  }
}