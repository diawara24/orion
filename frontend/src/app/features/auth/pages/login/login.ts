import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ApiError } from '@core/http/api-error.model';
import { FormApiErrorService } from '@core/http/form-api-error.service';
import { NotificationService } from '@core/notification/notification.service';
import { finalize } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly formApiErrorService = inject(FormApiErrorService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [ Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    password: ['',[ Validators.required],
    ],
  });

  constructor() {
    Object.values(this.loginForm.controls).forEach((control) => {
      control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.formApiErrorService.clearServerError(control);
      });
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);

    this.authService
      .login({ username, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.getReturnUrl()),
        error: (error: ApiError) => {
          if (!this.formApiErrorService.apply(error, this.loginForm)) {
            this.notificationService.error(error.detail);
          }
        },
      });
  }

  get f() {
    return this.loginForm.controls;
  }

  private getReturnUrl(): string {
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/feed';
  }
}
