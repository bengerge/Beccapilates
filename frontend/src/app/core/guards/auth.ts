import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UiService } from '../services/ui';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const uiService = inject(UiService);

  if (authService.getToken()) {
    return true;
  }

  uiService.openAuthModal();
  return router.createUrlTree(['/']);
};