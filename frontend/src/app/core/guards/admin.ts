import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      if (decoded.role === 'admin') {
        return true;
      }
    } catch (e) {
      return router.createUrlTree(['/']);
    }
  }

  return router.createUrlTree(['/']);
};