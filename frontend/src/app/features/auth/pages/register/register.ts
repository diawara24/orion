import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import type { ApiError } from '@core/http/api-error.model';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';



@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  selector: 'app-register',
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly formApiErrorService = inject(FormApiErrorService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);

  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/),
      ],
    ],
  });

  constructor() {
    Object.values(this.registerForm.controls).forEach((control) => {
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.formApiErrorService.clearServerError(control);
      });
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.registerForm.getRawValue();
    this.isSubmitting.set(true);

    this.authService
      .register({ username, email, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login'], { state: { registrationSucceeded: true } }),
        error: (error: ApiError) => {
          if (!this.formApiErrorService.apply(error, this.registerForm)) {
            this.notificationService.error(error.detail);
          }
        },
      });
  }

  get f() {
    return this.registerForm.controls;
  }
}
