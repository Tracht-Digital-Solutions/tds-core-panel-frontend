# tds-core-frontend-pkg

The **base panel host**, published as a package
(`@tracht-digital-solutions/tds-core-panel-frontend`). It ships the shell (chrome,
pre-paint auth gate, nav), the **base pages** (Dashboard/widget host, Login, user
management, Einstellungen, API-Wiki) and the **`corePanelBase` Astro integration**
— consumed by the **product repos** (`tds-admin-frontend` / `tds-customer-frontend`),
each of which composes this host with its own extension set + deploy pipeline.

> This repo is **not built as an app** anymore — the products are. It's a package
> of raw source (pages/layout/components/lib/styles) + a compiled integration.

## Consuming it (in a product repo)

```ts
// astro.config.mjs
import react from "@astrojs/react";
import { corePanelBase } from "@tracht-digital-solutions/tds-core-panel-frontend/astro";
import { panelHost } from "@tracht-digital-solutions/tds-panel-contract/astro";
import { tdsViteBuild } from "@tracht-digital-solutions/tds-shared/astro";
import timeTracker from "@tracht-digital-solutions/tds-ext-time-tracker";

process.env.PANEL_TARGET = "admin"; // or "customer"
process.env.PUBLIC_PANEL_TARGET = "admin";

export default defineConfig({
  output: "static",
  integrations: [react(), corePanelBase(), panelHost({ extensions: [timeTracker] })],
  vite: { build: { ...tdsViteBuild } },
});
```

- `corePanelBase()` — `injectRoute`s the base pages (`/`, `/login`, `/users`,
  `/einstellungen`, `/wiki`), whose entrypoints are this package's subpaths; their
  relative imports (Layout, components, lib, styles) resolve inside the package.
- `panelHost({ extensions })` (from `tds-panel-contract-pkg`) — injects each
  extension's route + the `virtual:panel-registry` / `-widgets` / `-settings`
  modules the shell reads.
- `PANEL_TARGET` picks the shell auth-hint key (`tds_admin_*` vs `tds_customer_*`)
  + brand ("Panel"/"Portal"); see `src/config/target.ts`.
- The product also needs `postcss.config.mjs` (`@tailwindcss/postcss`) + the peer
  deps (astro, react, tailwind, fonts). **Tailwind v4 note:** `src/styles/global.css`
  carries `@source "../../../"` so the product build scans this package AND every
  extension package in `node_modules` for classes (Tailwind ignores `node_modules`
  by default).

## Develop / release

```bash
npm install --no-package-lock   # contract + tds-shared-pkg from GitHub Packages (NPM_TOKEN)
npm run type-check              # tsc --noEmit
npm run build                   # tsup → dist/astro.js (the integration)
```

Push to `main` publishes a `@dev` prerelease; the manual **Release** button
publishes `@latest` + tags. Product repos then repin to the new `^version`.
