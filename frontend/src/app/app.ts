import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { UiService } from './core/services/ui';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal';
import { FooterComponent } from './shared/components/footer/footer';
import { ToastComponent } from './shared/components/toast/toast';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule, AuthModalComponent, FooterComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  uiService = inject(UiService);
  authModalOpen$ = this.uiService.authModalOpen$;
  title = 'Bekka Pilates';
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.checkAuthStatus().subscribe();
  }
}