# core-panel-frontend

The **base panel host** (Astro `output: "static"`). It ships the shell (chrome,
auth gate, nav), the **Dashboard widget host**, Wiki, user management and the
settings framework — and composes enabled **extensions** at build time via
`panel-contract` into one static panel.

One codebase, **two product targets**: the **admin** panel and the **customer**
panel are the same host built with different extension lists (different
`astro.config` / build env).

## How composition works

`astro.config.mjs` enables extensions:

```ts
import { panelHost } from "@tracht-digital-solutions/tds-panel-contract/astro";
import timeTracker from "@tracht-digital-solutions/tds-ext-time-tracker";
export default defineConfig({ integrations: [react(), panelHost({ extensions: [timeTracker] })] });
```

`panelHost` (build time): composes the manifests (fails loudly on conflict /
missing dep), `injectRoute()`s each extension route, and serves three virtual
modules the shell imports:

- `virtual:panel-registry` — nav, permissions, i18n, route + widget/settings metadata.
- `virtual:panel-widgets` — widgets with a real, statically imported `Component`
  (the Dashboard renders them in a loop; see `src/pages/index.astro`).
- `virtual:panel-settings` — ditto for the Einstellungen sections.

Declared for TypeScript in `src/env.d.ts`.

## Develop

```bash
npm install        # file: deps on ../tds-panel-contract + ../tds-ext-time-tracker in dev
npm run dev
npm run build      # → dist/ (the deployed static artifact)
npm run type-check # astro check — 0 errors gate
```

## Status

Real shell (CP1): `tds-shared` design system wired (base + app CSS, fonts,
`tdsViteBuild`), the ported pre-paint **auth gate** (presence hint + `/me`
confirmation + `html.auth-checking` spinner) in `Layout.astro`, brand chrome with
the composed nav from `virtual:panel-registry`, a `/login` page + `LoginForm`, the
`~/lib/auth` fetch wrapper (401→`/me` backstop, cross-panel SSO hints), and the
`CookieNotice`. Builds green (`/`, `/login`, `/time`), type-check 0 errors, fonts
emitted. Still to port from `tds-admin`: Wiki, user management, the settings
framework page, per-user dashboard layout, and the customer product target.
