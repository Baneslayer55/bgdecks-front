# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (auto-reloads)
npm run build      # production build → dist/bd-front-angular/
npm run watch      # dev build with watch mode
npm test           # run unit tests with Vitest
```

Run a single test file: `ng test --include src/app/some.spec.ts`

Use `ng generate component|service|pipe|directive <name>` for scaffolding.

## Architecture

This is a **client-side-rendered Angular 21 application** using standalone components (no NgModules).

Single bootstrap path: `src/main.ts` → bootstraps `App` with `appConfig` from `src/app/app.config.ts`.

The root `App` component (`src/app/app.ts`) renders only `<router-outlet />`. Pages live in `src/app/pages/` and are **lazy-loaded** via `loadComponent` in `app.routes.ts`.
### Folder rules
each feature grouped by its business theme. all components are grouped in srv/app/features folder.

### Api rules
all http calls must be wrapped in services, which uses API_BASE_URL env to set base api path
### Key files

| File                    | Purpose                                             |
|-------------------------|-----------------------------------------------------|
| `src/app/app.ts`        | Root component — just hosts `<router-outlet />`     |
| `src/app/app.config.ts` | Global providers: router, animations, PrimeNG theme |
| `src/app/app.routes.ts` | Routes with lazy `loadComponent` per page           |
| `src/app/pages/home/`   | Home page component (`/` route)                     |
| `src/styles.css`        | Global styles — imports Tailwind CSS                |

## Stack

- **Angular 21** — strict TypeScript, standalone components, `withComponentInputBinding()` on the router
- **PrimeNG 21** with `@primeuix/themes` Aura preset; configured via `providePrimeNG()` in `app.config.ts`
- **`@angular/cdk`** — required peer dep of PrimeNG 21
- **Tailwind CSS v4** via PostCSS (`@tailwindcss/postcss`)
- **Vitest** for unit tests (not Karma/Jasmine — `tsconfig.spec.json` uses `vitest/globals`)
- **Prettier**: single quotes, 100-char print width, `angular` parser for HTML files

## PrimeNG usage

Import component modules directly in each standalone component's `imports` array:

```typescript
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
```

The theme (Aura) is applied globally via `providePrimeNG()` in `app.config.ts` — no per-component theme setup needed.
