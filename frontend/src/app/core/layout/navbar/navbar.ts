import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notification/notification.service';

@Component({
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule, MatToolbarModule],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly currentUser = toSignal(
    this.authService.currentUser$,
    { initialValue: this.authService.getCurrentUser() },
  );
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  logout(): void {
    this.authService.logout();
    this.notificationService.success('Vous êtes déconnecté.');
    void this.router.navigateByUrl('/');
  }
}
