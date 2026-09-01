import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.toastService.show('Érvénytelen visszaállító link.', 'error');
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (!this.token || !this.newPassword || !this.confirmPassword) return;
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.show('A jelszavak nem egyeznek!', 'error');
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res: any) => {
        this.toastService.show(res.detail || 'Jelszó sikeresen módosítva!', 'success');
        this.router.navigate(['/']); // Redirect to home (which has the login modal)
      },
      error: (err) => {
        this.toastService.show(err.error?.detail || 'Hiba a jelszó visszaállításakor.', 'error');
        this.isSubmitting = false;
      }
    });
  }
}
