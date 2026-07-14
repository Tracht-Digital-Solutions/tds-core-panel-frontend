# core-panel-frontend

The **base panel host** (Astro `output: "static"`). It ships the shell (chrome,
auth gate, nav), the **Dashboard widget host**, Wiki, user management and the
settings framework — and composes enabled **extensions** at build time via
`panel-contract` into one static panel.

One codebase, **two product targets** selected by `PANEL_TARGET`:

```bash
npm run build                    # admin panel  (all internal tools)
PANEL_TARGET=customer npm run build   # customer portal (customer-facing extensions)
```

The target picks the enabled extension set (`astro.config.mjs`), the auth hint
key (`tds_admin_*` vs `tds_customer_*`, so a stale admin hint can't reveal the
portal — the shared session cookie still SSOs where the principal has access),
and the brand suffix ("Panel" / "Portal"). See `src/config/target.ts`. The
`tds-admin-panel` / `tds-customer-panel` repos are the deploy targets for these
two builds.

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
emitted. **User management (CP2):** a `/users` page + `UsersAdmin` island talking
to tds-auth-api's `/admin/users` endpoints (list / create / toggle-admin /
reset-password / delete) via `panelFetch`; base-service nav ("Verwaltung":
Dashboard + Nutzer) sits alongside the extension-contributed nav. **Settings host (CP3):** `/einstellungen` renders every enabled extension's
settings section from `virtual:panel-settings` (the same host pattern as the
dashboard widgets). The host now enables **three real extensions** (time-tracker,
support-tickets, website-cms) — the build composes 3 routes + 3 dashboard widgets
+ 3 settings panels + grouped nav, proving nav + widgets + settings end-to-end.
Still to port from `tds-admin`: fine-grained permission + company-membership
editing, Wiki, per-user dashboard layout, and the customer product target.
