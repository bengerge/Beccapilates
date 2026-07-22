import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { UiService } from '../services/ui';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const uiService = inject(UiService);

  // Várjuk meg, amíg a backend visszaigazolja a sütit
  return authService.checkAuthStatus().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        uiService.openAuthModal();
        router.navigate(['/']);
        return false;
      }
    })
  );
};