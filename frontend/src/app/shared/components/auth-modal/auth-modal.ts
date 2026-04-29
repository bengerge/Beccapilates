import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { UiService } from '../../../core/services/ui';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.html',
  styleUrls: ['./auth-modal.scss']
})
export class AuthModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  uiService = inject(UiService);

  isLoginMode = true;
  authForm!: FormGroup;
  errorMessage = '';

  ngOnInit() {
    this.initForm();
  }

  initForm() {
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
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
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
    if (this.authForm.invalid) return;

    if (this.isLoginMode) {
      this.authService.login(this.authForm.value).subscribe({
        next: () => this.closeModal(),
        error: () => this.errorMessage = 'Helytelen email vagy jelszó!'
      });
    } else {
      this.authService.register(this.authForm.value).subscribe({
        next: () => {
          this.isLoginMode = true;
          this.initForm();
          this.errorMessage = 'Sikeres regisztráció! Kérlek jelentkezz be.';
        },
        error: (err) => this.errorMessage = err.error?.detail || 'Hiba a regisztráció során.'
      });
    }
  }
}