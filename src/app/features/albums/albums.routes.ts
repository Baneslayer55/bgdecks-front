import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const albumsRoutes: Routes = [
  {
    path: 'public',
    loadComponent: () =>
      import('./pages/public/public-albums.component').then((m) => m.PublicAlbumsComponent),
  },
  {
    path: 'my',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my/my-albums.component').then((m) => m.MyAlbumsComponent),
  },
  {
    path: ':albumId',
    loadComponent: () =>
      import('./pages/detail/album-detail.component').then((m) => m.AlbumDetailComponent),
  },
];
