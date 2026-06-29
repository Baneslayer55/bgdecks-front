import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const decksRoutes: Routes = [
  {
    path: 'public',
    loadComponent: () =>
      import('./pages/public/public-decks.component').then((m) => m.PublicDecksComponent),
  },
  {
    path: 'my',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my/my-decks.component').then((m) => m.MyDecksComponent),
  },
  {
    path: ':deckId',
    loadComponent: () =>
      import('./pages/detail/deck-detail.component').then((m) => m.DeckDetailComponent),
  },
];
