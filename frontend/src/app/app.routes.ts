import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/pages/home/home').then((m) => m.Home),
        title: 'Home',
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
        title: 'Connexion | Orion',
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register').then((m) => m.Register),
        title: 'Inscription | Orion',
      },
      {
        path: '**',
        loadComponent: () => import('./shared/pages/not-found/not-found').then((m) => m.NotFound),
        title: 'Page introuvable | Orion',
      }
    ]
  }
];
