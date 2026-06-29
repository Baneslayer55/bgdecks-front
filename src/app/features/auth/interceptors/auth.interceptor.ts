import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, from, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL, CARDS_API_BASE_URL } from '../../../shared/api.config';
import { TokenStorageService } from '../services/token-storage/token-storage.service';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const cardsApiBaseUrl = inject(CARDS_API_BASE_URL);
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  const isProtected =
    req.url.startsWith(apiBaseUrl) || req.url.startsWith(cardsApiBaseUrl);
  if (!isProtected) {
    return next(req);
  }

  const token = tokenStorage.getAccessToken();
  if (!token) {
    return next(req);
  }

  const withBearer = (r: HttpRequest<unknown>) => {
    const t = tokenStorage.getAccessToken();
    return t ? r.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : r;
  };

  const handleUnauthorized = (originalError: HttpErrorResponse) =>
    from(authService.refreshTokens()).pipe(
      switchMap(() => next(withBearer(req))),
      catchError(() => {
        authService.forceLogout();
        return throwError(() => originalError);
      }),
    );

  const proceed$ = authService.isTokenExpired(token)
    ? from(authService.refreshTokens()).pipe(
        catchError((err) => {
          authService.forceLogout();
          return throwError(() => err);
        }),
        switchMap(() => next(withBearer(req))),
      )
    : next(withBearer(req));

  return proceed$.pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handleUnauthorized(error);
      }
      return throwError(() => error);
    }),
  );
};
