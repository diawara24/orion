import { HttpRequest, HttpResponse, type HttpHandlerFn, type HttpInterceptorFn } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let authService: { getToken: ReturnType<typeof vi.fn> };
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    authService = { getToken: vi.fn() };
    next = vi.fn(() => of(new HttpResponse({ status: 200 }))) as ReturnType<typeof vi.fn>;

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
  });

  it('adds the Bearer token to an authenticated request sent to the Orion API', () => {
    authService.getToken.mockReturnValue('access-token');
    const request = new HttpRequest('GET', '/api/v1/articles');

    interceptor(request, next as HttpHandlerFn).subscribe();

    const forwardedRequest = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer access-token');
  });

  it('forwards an Orion API request unchanged when no token is stored', () => {
    authService.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/v1/articles');

    interceptor(request, next as HttpHandlerFn).subscribe();

    expect(next).toHaveBeenCalledWith(request);
  });

  it('does not attach a stale token to the public login request', () => {
    authService.getToken.mockReturnValue('stale-token');
    const request = new HttpRequest('POST', '/api/v1/auth/login');

    interceptor(request, next as HttpHandlerFn).subscribe();

    expect(next).toHaveBeenCalledWith(request);
  });

  it('never forwards the token to a third-party URL', () => {
    authService.getToken.mockReturnValue('access-token');
    const request = new HttpRequest('GET', 'https://example.com/telemetry');

    interceptor(request, next as HttpHandlerFn).subscribe();

    expect(next).toHaveBeenCalledWith(request);
  });
});
