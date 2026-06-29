# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (auto-reloads)
npm run build      # production build → dist/bd-front-angular/
npm run watch      # dev build with watch mode
npm test           # run all unit tests with Vitest
```

Run a single test file: `ng test --include src/app/some.spec.ts`

Scaffold: `ng generate component|service|pipe|directive <name>`

## Architecture

**Angular 21**, standalone components only (no NgModules), strict TypeScript.

Bootstrap path: `src/main.ts` → `appConfig` (`src/app/app.config.ts`) → `<router-outlet />`.

### Feature structure

All features live under `src/app/features/<feature>/` with this internal layout:

```
features/<feature>/
  <feature>.routes.ts       # child routes, loaded lazily from app.routes.ts
  pages/<page>/             # routable page components
  components/<name>/        # dumb/presentational components for this feature
  services/<name>.service.ts
  models/<name>.model.ts
  guards/ | interceptors/   # (auth feature only)
```

Current features: `auth`, `cards`, `decks`, `home`, `users`.

Shared components used across features: `src/app/shared/components/`.
Shared models: `src/app/shared/models/card.model.ts`.

### Routing

`app.routes.ts` lazy-loads each feature via `loadChildren` (routes) or `loadComponent` (single page). Each feature owns its own `<feature>.routes.ts`. Protected routes use `authGuard` (`src/app/features/auth/guards/auth.guard.ts`).

### State management

- **Angular signals** (`signal`, `computed`, `model`) for component-local reactive state.
- **RxJS** for HTTP streams and event pipelines (debounce, takeUntil destroy$).
- No NgRx or global store — state lives in services or page components.

### Auth flow

Custom Keycloak PKCE implementation (no library):
- `AuthService` builds the auth/token/logout URLs from `KEYCLOAK_BASE_URL` injection token.
- PKCE verifier and OAuth state stored in `sessionStorage` during the redirect.
- `TokenStorageService` persists access/refresh/id tokens.
- `authInterceptor` attaches `Bearer` token to requests targeting `API_BASE_URL` or `CARDS_API_BASE_URL`; auto-refreshes on expiry or 401.
- `AuthService.isAuthenticated` is a `computed` signal derived from token presence.

### API injection tokens

Two backend bases, both defined in `src/app/shared/api.config.ts` and provided in `app.config.ts`:

| Token | Value | Used by |
|-------|-------|---------|
| `API_BASE_URL` | `https://www.berserkdeck.ru/dev/api` | (future endpoints) |
| `CARDS_API_BASE_URL` | `https://bgdecks.ru/api/v2` | cards, decks, users services |

All HTTP calls must go through `@Injectable({ providedIn: 'root' })` services that inject one of these tokens — never hardcode URLs.

### Component patterns

```typescript
// DI — always inject(), never constructor params
private readonly service = inject(MyService);

// Required input
readonly value = input.required<string>();

// Two-way binding
readonly selected = model<string[]>([]);

// Signals
readonly loading = signal(false);
readonly pageSize = computed(() => this.columns() * this.rows());
```

PrimeNG components are imported directly in each standalone component's `imports` array (e.g. `ButtonModule`, `SelectModule`). No per-component theme setup needed — Aura dark theme is global.

Dark mode is toggled by adding the `.dark` class to the document root. The surface palette and primary color are defined in `src/app/shared/theme.config.ts`.

## Stack

- **Angular 21** — `withComponentInputBinding()` on the router
- **PrimeNG 21** with `@primeuix/themes` Aura preset
- **Tailwind CSS v4** via PostCSS
- **Vitest** (not Karma/Jasmine — `tsconfig.spec.json` uses `vitest/globals`)
- **Prettier**: single quotes, 100-char print width, `angular` parser for HTML
