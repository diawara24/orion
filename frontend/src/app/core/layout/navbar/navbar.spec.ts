import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import type { User } from '@core/model/auth.model';
import { NotificationService } from '@core/notification/notification.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let currentUser: BehaviorSubject<User | null>;

  beforeEach(async () => {
    currentUser = new BehaviorSubject<User | null>(null);

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser$: currentUser.asObservable(),
            getCurrentUser: vi.fn(() => currentUser.value),
            logout: vi.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  it('displays public navigation for an anonymous visitor', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Se connecter');
    expect(fixture.nativeElement.textContent).toContain('Créer un compte');
    expect(fixture.nativeElement.textContent).not.toContain('Actualités');
  });

  it('displays the feed link and username for an authenticated user', () => {
    currentUser.next({
      id: '90e9d2cd-f3e3-4a95-8c5a-8794e7dff2e9',
      username: 'orlando',
      email: 'orlando@example.com',
      createdAt: '2026-10-02T10:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Actualités');
    expect(fixture.nativeElement.textContent).toContain('orlando');
    expect(fixture.nativeElement.textContent).not.toContain('Créer un compte');
  });
});
