import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '@core/auth/auth.service';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { NotificationService } from '@core/notification/notification.service';
import type { ApiError } from '@core/http/api-error.model';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: { login: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };
  let activatedRoute: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };
  let notificationService: { error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {

    authService = {
      login: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };
    activatedRoute = {
      snapshot: { queryParamMap: convertToParamMap({}) },
    };
    notificationService = {
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: NotificationService, useValue: notificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('marks every field as touched instead of calling the API when the form is invalid', () => {
    component.onSubmit();

    expect(component.f.username.touched).toBe(true);
    expect(component.f.password.touched).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('logs the user in then redirects to the feed after a successful response', () => {
    authService.login.mockReturnValue(
      of({
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MGU5ZDJjZC1mM2UzLTRhOTUtOGM1YS04Nzk0ZTdkZmYyZTkiLCJpYXQiOjE2OTY3NzQ4MDAsImV4cCI6MTY5Njc3ODQwMH0.7g8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v8kW8x7v',
        tokenType: 'Bearer',
        user: {
          id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
          username: 'orlando',
          email: 'orlando@example.com',
          createdAt: '2026-10-02T10:00:00Z',
          updatedAt: '2026-10-02T10:00:00Z',
        },
      }),
    );
    component.loginForm.setValue({
      username: 'orlando',
      password: 'Orion2026!',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'orlando',
      password: 'Orion2026!',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/feed');
  });

  it('redirects the user to the route requested before authentication', () => {
    activatedRoute.snapshot.queryParamMap = convertToParamMap({ returnUrl: '/articles/article-id' });
    authService.login.mockReturnValue(of({}));
    component.loginForm.setValue({
      username: 'orlando',
      password: 'Orion2026!',
    });

    component.onSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/articles/article-id');
  });

  it('notifies the user with the backend message when credentials are rejected', () => {
    const unauthorized: ApiError = {
      type: 'about:blank',
      title: 'Identifiants invalides',
      status: 401,
      detail: 'Le nom d’utilisateur, l’adresse e-mail ou le mot de passe est invalide.',
      instance: '/api/v1/auth/login',
    };
    authService.login.mockReturnValue(throwError(() => unauthorized));
    component.loginForm.setValue({
      username: 'orlando',
      password: 'Orion2026!',
    });

    component.onSubmit();

    expect(notificationService.error).toHaveBeenCalledWith(unauthorized.detail);
  });
});
