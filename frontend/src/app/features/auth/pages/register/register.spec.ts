import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import type { ApiError } from '@core/http/api-error.model';
import { NotificationService } from '@core/notification/notification.service';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authService: { register: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let notificationService: { error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };
    notificationService = {
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
  });

  it('marks every field as touched instead of calling the API when the form is invalid', () => {
    component.onSubmit();

    expect(component.f.username.touched).toBe(true);
    expect(component.f.email.touched).toBe(true);
    expect(component.f.password.touched).toBe(true);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registers the user then redirects to login after a successful response', () => {
    authService.register.mockReturnValue(
      of({
        id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
        username: 'orlando',
        email: 'orlando@example.com',
        createdAt: '2026-10-02T10:00:00Z',
        updatedAt: '2026-10-02T10:00:00Z',
      }),
    );
    component.registerForm.setValue({
      username: 'orlando',
      email: 'orlando@example.com',
      password: 'Orion2026!',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      username: 'orlando',
      email: 'orlando@example.com',
      password: 'Orion2026!',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      state: { registrationSucceeded: true },
    });
  });

  it('notifies the user with the backend message when registration fails globally', () => {
    const conflict: ApiError = {
      type: 'about:blank',
      title: 'Conflit',
      status: 409,
      detail: 'Cette ressource existe déjà.',
      instance: '/api/v1/auth/register',
    };
    authService.register.mockReturnValue(throwError(() => conflict));
    component.registerForm.setValue({
      username: 'orlando',
      email: 'orlando@example.com',
      password: 'Orion2026!',
    });

    component.onSubmit();

    expect(notificationService.error).toHaveBeenCalledWith('Cette ressource existe déjà.');
  });
});
