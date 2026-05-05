import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { ClassService } from '../../core/services/class';
import { BookingService } from '../../core/services/booking';

export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const passwordConfirm = control.get('passwordConfirm');
  if (password?.value && passwordConfirm?.value && password.value !== passwordConfirm.value) {
    return { passwordsMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);
  classService = inject(ClassService);
  bookingService = inject(BookingService);
  fullProfile: any = null;
  myBookings: any[] = [];
  isEditing = false;
  profileForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadProfile();
    this.loadMyBookings();
  }

  initForm() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.minLength(6)]],
      passwordConfirm: ['']
    }, { validators: passwordsMatchValidator });
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.fullProfile = data;
        this.profileForm.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: '',
          passwordConfirm: ''
        });
      }
    });
  }

  loadMyBookings() {
    this.bookingService.getMyBookings().subscribe({
      next: (data) => this.myBookings = data,
      error: () => this.myBookings = []
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile();
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    const formValue = this.profileForm.value;
    const updateData: any = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone
    };

    if (formValue.password) {
      updateData.password = formValue.password;
    }

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        alert('Sikeresen frissítetted a profilodat!');
        this.isEditing = false;
        this.loadProfile();
      },
      error: () => alert('Hiba történt a frissítés során.')
    });
  }

  deleteAccount() {
    if (confirm('Biztosan törölni szeretnéd a fiókodat? Ezt a műveletet NEM lehet visszavonni!')) {
      this.authService.deleteAccount().subscribe({
        next: () => {
          alert('Fiókodat sikeresen töröltük.');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: () => alert('Hiba történt a fiók törlése során.')
      });
    }
  }
}