import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MessageService } from 'primeng/api';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { API_BASE_URL } from './shared/api.config';
import { KEYCLOAK_BASE_URL } from './shared/keycloak.config';
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { THEME } from './shared/theme.config';

const AppTheme = definePreset(Aura, {
  semantic: {
    primary: palette(THEME.primary),
    formField: THEME.formField,
    colorScheme: {
      dark: {
        surface: THEME.surface,
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: 'https://bgdecks.ru/api/v2' },
    { provide: KEYCLOAK_BASE_URL, useValue: 'https://bgdecks.ru/auth' },
    MessageService,
    providePrimeNG({
      theme: {
        preset: AppTheme,
        options: {
          darkModeSelector: '.dark',
        },
      },
    }),
  ],
};
