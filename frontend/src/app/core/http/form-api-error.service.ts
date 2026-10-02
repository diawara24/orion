import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import type { ApiError } from './api-error.model';

/** Associe les erreurs de validation de l’API aux contrôles d’un formulaire. */
@Injectable({
  providedIn: 'root',
})
export class FormApiErrorService {
  apply(error: ApiError, form: AbstractControl): boolean {
    if (!error.errors) {
      return false;
    }

    let hasFieldError = false;

    Object.entries(error.errors).forEach(([field, message]) => {
      const control = form.get(field);

      if (!control) {
        return;
      }

      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
      hasFieldError = true;
    });

    return hasFieldError;
  }

  clearServerError(control: AbstractControl): void {
    if (!control.hasError('server')) {
      return;
    }

    const { server: _serverError, ...remainingErrors } = control.errors ?? {};
    control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
  }
}
