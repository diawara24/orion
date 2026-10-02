import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: { isAuthenticated: ReturnType<typeof vi.fn> };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isAuthenticated: vi.fn() };
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

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/feed' } as RouterStateSnapshot,
    );

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
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
  });
});
