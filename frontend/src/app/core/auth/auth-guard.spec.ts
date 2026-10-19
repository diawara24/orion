import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard, publicHomeGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));
  const executePublicHomeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => publicHomeGuard(...guardParameters));

  let authService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    isTokenExpired: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      isAuthenticated: vi.fn(),
      isTokenExpired: vi.fn(),
      logout: vi.fn(),
    };
    router = { createUrlTree: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows navigation when the user has an active session', () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.isTokenExpired.mockReturnValue(false);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/feed' } as RouterStateSnapshot,
    );

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('redirects an anonymous user to login and preserves the requested URL', () => {
    const loginUrlTree = {} as UrlTree;
    authService.isAuthenticated.mockReturnValue(false);
    router.createUrlTree.mockReturnValue(loginUrlTree);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/feed?page=2' } as RouterStateSnapshot,
    );

    expect(result).toBe(loginUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/feed?page=2' },
    });
    expect(authService.logout).toHaveBeenCalledOnce();
  });

  it('redirects and clears the session when the token has expired', () => {
    const loginUrlTree = {} as UrlTree;
    authService.isAuthenticated.mockReturnValue(true);
    authService.isTokenExpired.mockReturnValue(true);
    router.createUrlTree.mockReturnValue(loginUrlTree);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/profile' } as RouterStateSnapshot,
    );

    expect(result).toBe(loginUrlTree);
    expect(authService.logout).toHaveBeenCalledOnce();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/profile' },
    });
  });

  it('redirects an authenticated user from the public home page to the feed', () => {
    const feedUrlTree = {} as UrlTree;
    authService.isAuthenticated.mockReturnValue(true);
    authService.isTokenExpired.mockReturnValue(false);
    router.createUrlTree.mockReturnValue(feedUrlTree);

    const result = executePublicHomeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/' } as RouterStateSnapshot,
    );

    expect(result).toBe(feedUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/feed']);
  });

  it('keeps the public home page accessible to an anonymous user', () => {
    authService.isAuthenticated.mockReturnValue(false);

    const result = executePublicHomeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/' } as RouterStateSnapshot,
    );

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
