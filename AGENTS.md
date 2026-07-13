# AGENTS.md — core-panel-frontend

The base panel host. Read `panel-contract`'s AGENTS.md first — this repo consumes
that contract.

## What's base vs. extension

**Base (here):** shell/chrome, the pre-paint auth gate (`/me`-confirmed presence
hint — port from `tds-admin`'s `Layout.astro`, DON'T reinvent), nav renderer,
**Dashboard widget host** + per-user layout, Wiki, user management, the settings
framework (the wizard/list shell; individual sections come from extensions),
i18n plumbing, the API fetch wrapper (401→`/me` backstop, cross-panel SSO).

**Extensions (other repos):** time-tracker, blog-CMS, website-CMS, contact- and
support-tickets, … They contribute pages/widgets/nav/settings/permissions/i18n
through `panel-contract` — never edited here.

## Composition (build-time only)

`panelHost({ extensions: [...] })` in `astro.config.mjs`. No runtime plugin
loading, never `output: "server"`. The shell reads `virtual:panel-registry`
(nav/permissions/i18n), `virtual:panel-widgets` and `virtual:panel-settings`
(components with real imports). Declared in `src/env.d.ts`.

## Two product targets

Admin and customer are the same host with different extension lists. Keep target
differences to the `astro.config` / build env, not forks of the shell.

## Gotchas (carried from the platform)

- Astro can't hydrate a component named only by a string — the widget/settings
  virtual modules carry real imports; render `const W = item.Component; <W />`.
- Keep the frontend **static**; the auth gate is inline `<head>` + `/me` probe.
- Don't hand-author the lightningcss `cssTarget`; spread tds-shared's
  `tdsViteBuild` once the design system is wired.
- `npm install --no-package-lock` (Windows lockfile is win32-only).

## Status / next

Skeleton validates end-to-end composition (package route + nav + hydrated
widget). Next: port the auth gate + chrome, wire `tds-shared`, build the Wiki /
users / settings-framework pages, add per-user dashboard layout, and stand up the
customer target.
