import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { ApiError } from './api-error.model';
import { FormApiErrorService } from './form-api-error.service';

describe('FormApiErrorService', () => {
  const service = new FormApiErrorService();

  it('associates validation messages with matching form controls', () => {
    const form = new FormGroup({
      email: new FormControl('', { validators: [Validators.required] }),
    });
    const error: ApiError = {
      type: 'about:blank',
      title: 'Données invalides',
      status: 400,
      detail: 'La requête contient des données invalides.',
      instance: '/api/v1/auth/register',
      errors: { email: 'Cette adresse e-mail est invalide.' },
    };

    const hasFieldError = service.apply(error, form);

    expect(hasFieldError).toBe(true);
    expect(form.controls.email.getError('server')).toBe('Cette adresse e-mail est invalide.');
    expect(form.controls.email.touched).toBe(true);
  });

  it('returns false when the API error has no matching form field', () => {
    const form = new FormGroup({ email: new FormControl('') });
    const error: ApiError = {
      type: 'about:blank',
      title: 'Données invalides',
      status: 400,
      detail: 'La requête contient des données invalides.',
      instance: '/api/v1/auth/register',
      errors: { username: 'Ce nom est invalide.' },
    };

    expect(service.apply(error, form)).toBe(false);
  });
});
