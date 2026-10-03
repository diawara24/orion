import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/pages/home/home').then((m) => m.Home),
    title: 'Home',
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
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
    ],
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/app-shell/app-shell').then((m) => m.AppShell),
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        loadComponent: () => import('./features/feed/pages/feed/feed').then((m) => m.Feed),
        title: "Fil d'actualité | Orion"
      },
      {
        path: 'articles/create',
        loadComponent: () => import('./features/articles/pages/article-create/article-create').then((m) => m.ArticleCreate),
        title: "Créer un article | Orion"
      },
      {
        path: 'articles/:id',
        loadComponent: () => import('./features/articles/pages/article-detail/article-detail').then((m) => m.ArticleDetail),
        title: "Détail de l'article | Orion"
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Page introuvable | Orion',
  },
];
