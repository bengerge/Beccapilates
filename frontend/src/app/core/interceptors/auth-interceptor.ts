import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiService } from '../services/ui';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const uiService = inject(UiService);

  // Nincs többé Authorization header! Helyette bekapcsoljuk a sütik küldését:
  const modifiedReq = req.clone({
    withCredentials: true
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 esetén megnyitjuk a bejelentkezési modált (kivéve a háttérbeli /auth/me ellenőrzésnél)
      if (error.status === 401 && !req.url.includes('/auth/me') && !req.url.includes('/auth/login')) {
        uiService.openAuthModal();
      }
      return throwError(() => error);
    })
  );
};