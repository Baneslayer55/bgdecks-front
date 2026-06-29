import { Routes } from '@angular/router';

export const cardsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cards/cards.component').then((m) => m.CardsComponent),
  },
];
