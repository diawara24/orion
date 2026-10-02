import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * renvoie une notification d'erreur avec le message fourni.
   * @param message Le message d'erreur à afficher.
   */
  error(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5_000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      politeness: 'assertive',
      panelClass: ['error-snackbar'], // Applique une classe CSS personnalisée pour le style de l'erreur
    });
  }

  /**
   * renvoie une notification de succès avec le message fourni.
   * @param message Le message de succès à afficher.
   */
  success(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3_000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      politeness: 'polite',
    });
  }
}
