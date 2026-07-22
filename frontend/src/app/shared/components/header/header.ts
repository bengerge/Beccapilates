import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UiService } from '../../../core/services/ui';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private uiService = inject(UiService);
  private toastService = inject(ToastService);

  isMobileMenuOpen = false;

  currentUser$ = this.authService.currentUser$;

  openLogin() {
    this.uiService.openAuthModal();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.toastService.show('Sikeresen kijelentkeztél!', 'success');
    this.closeMobileMenu();
  }
}