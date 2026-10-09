import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { apiErrorInterceptor } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: { url: string; navigate: ReturnType<typeof vi.fn> };
  let authService: { logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { url: '/profile', navigate: vi.fn().mockResolvedValue(true) };
    authService = { logout: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('clears the session and redirects on a 401 from a protected API endpoint', () => {
    let receivedError: unknown;

    http.get('/api/v1/users/me').subscribe({ error: (error: unknown) => receivedError = error });
    httpMock.expectOne('/api/v1/users/me').flush(
      {
        type: 'about:blank',
        title: 'Non autorisé',
        status: 401,
        detail: 'Votre session a expiré.',
        instance: '/api/v1/users/me',
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/profile' } });
    expect(receivedError).toMatchObject({ status: 401, detail: 'Votre session a expiré.' });
  });

  it('does not redirect when login credentials are rejected', () => {
    http.post('/api/v1/auth/login', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/v1/auth/login').flush(
      { detail: 'Identifiants invalides.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
