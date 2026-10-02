import { catchError, type Observable, throwError } from 'rxjs';
import { toApiError } from './api-error.model';


export function catchApiError<T>() {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: unknown) => throwError(() => toApiError(error)))
    );
}
