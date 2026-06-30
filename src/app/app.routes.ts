import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'decks',
    loadChildren: () => import('./features/decks/decks.routes').then((m) => m.decksRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'cards',
    loadChildren: () => import('./features/cards/cards.routes').then((m) => m.cardsRoutes),
  },
  {
    path: 'albums',
    loadChildren: () => import('./features/albums/albums.routes').then((m) => m.albumsRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
  },
];
