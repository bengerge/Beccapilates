import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthStatus().pipe(
    map(isAuthenticated => {
      const user = authService.getCurrentUser();
      if (isAuthenticated && user && user.role === 'admin') {
        return true;
      } else {
        router.navigate(['/']); // Vagy /login
        return false;
      }
    })
  );
};