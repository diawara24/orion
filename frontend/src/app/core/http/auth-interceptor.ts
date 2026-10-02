import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@env/environment';

const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
const publicAuthEndpoints = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!isOrionApiRequest(req.url) || isPublicAuthRequest(req.url) || req.headers.has('Authorization')) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};

function isOrionApiRequest(url: string): boolean {
  return url === apiBaseUrl || url.startsWith(`${apiBaseUrl}/`);
}

function isPublicAuthRequest(url: string): boolean {
  const requestPath = url.split('?')[0];
  return publicAuthEndpoints.some((endpoint) => requestPath.endsWith(endpoint));
}
