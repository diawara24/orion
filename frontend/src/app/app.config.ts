import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApi } from './core/api';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Gerer les erreur s globales
    provideBrowserGlobalErrorListeners(),

    // Gerer les changement de zone (ie: changement de contexte d'execution)
    provideZoneChangeDetection(),

    // Gerer les routes de l'application avec la possibilite de lier les inputs des composants aux routes
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        // Configuration de la gestion du scroll
        // https://angular.io/api/router/withMemoryScrolling
        scrollPositionRestoration: 'enabled', // Restaure la position du scroll lors de la navigation
      })
    ),

    // Gerer les requetes HTTP
    provideHttpClient(),

    // Gerer l'API de l'application
    provideApi(environment.apiBaseUrl),


  ]
};
