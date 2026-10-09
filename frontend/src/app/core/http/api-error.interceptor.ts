import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { isOrionApiRequest, isPublicAuthRequest } from './api-url.utils';
import { toApiError } from './api-error.model';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);

      if (shouldRedirectToLogin(req.url, apiError.status, router.url)) {
        const returnUrl = router.url;

        authService.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => apiError);
    }),
  );
};

function shouldRedirectToLogin(url: string, status: number, currentUrl: string): boolean {
  return status === 401
    && isOrionApiRequest(url)
    && !isPublicAuthRequest(url)
    && !currentUrl.startsWith('/login');
}
