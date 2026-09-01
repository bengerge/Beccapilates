import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email: string = '';
  isSubmitting = false;

  onSubmit() {
    if (!this.email) return;
    this.isSubmitting = true;
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.toastService.show(res.detail || 'Email elküldve!', 'success');
        this.isSubmitting = false;
        this.email = '';
      },
      error: (err) => {
        this.toastService.show(err.error?.detail || 'Hiba történt.', 'error');
        this.isSubmitting = false;
      }
    });
  }
}
