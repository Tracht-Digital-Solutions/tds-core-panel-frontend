import type { AstroIntegration } from "astro";

/**
 * `corePanelBase()` — the Astro integration that injects the base panel's routes
 * (Dashboard, Login, Nutzer, Einstellungen, API-Wiki) into a consuming product
 * build. A product repo (tds-admin-panel / tds-customer-panel) adds this
 * alongside `panelHost({ extensions })` (which injects the extension routes +
 * widget/settings virtual modules) — so one shared host codebase serves every
 * product target, each owning only its extension set + pipeline.
 *
 * The entrypoints are package subpaths (resolved from the product's node_modules);
 * their relative imports (Layout, components, lib, styles) resolve within this
 * package. Uses the SAME injectRoute mechanism panel-contract already uses for
 * extension pages.
 */
const PKG = "@tracht-digital-solutions/tds-core-panel-frontend";

const BASE_ROUTES: ReadonlyArray<{ pattern: string; entrypoint: string }> = [
  { pattern: "/", entrypoint: `${PKG}/src/pages/index.astro` },
  { pattern: "/login", entrypoint: `${PKG}/src/pages/login.astro` },
  { pattern: "/users", entrypoint: `${PKG}/src/pages/users.astro` },
  { pattern: "/einstellungen", entrypoint: `${PKG}/src/pages/einstellungen.astro` },
  { pattern: "/wiki", entrypoint: `${PKG}/src/pages/wiki.astro` },
];

export function corePanelBase(): AstroIntegration {
  return {
    name: "tds-core-panel-base",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        for (const route of BASE_ROUTES) {
          injectRoute(route);
        }
      },
    },
  };
}

export default corePanelBase;
