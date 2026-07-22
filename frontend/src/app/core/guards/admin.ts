import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { UiService } from '../services/ui';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const uiService = inject(UiService);

  return authService.checkAuthStatus().pipe(
    map(isAuthenticated => {
      const user = authService.getCurrentUser();
      if (isAuthenticated && user && user.role === 'admin') {
        return true;
      } else {
        if (!isAuthenticated) {
          uiService.openAuthModal();
        }
        router.navigate(['/']);
        return false;
      }
    })
  );
};