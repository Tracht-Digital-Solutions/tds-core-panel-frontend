/**
 * Product target — the base host builds as the **admin** OR **customer** panel
 * from the same code, selected by `PUBLIC_PANEL_TARGET` (default admin). This
 * only carries the per-target differences the SHELL needs (auth hint key, brand
 * label); the extension *list* is chosen in astro.config (a build-time import
 * set), and the API URLs come from `PUBLIC_*` env.
 *
 * The hint key differs per panel so a stale admin hint can't reveal the customer
 * panel; the httpOnly session cookie is still shared (Domain=.tracht-digital.de)
 * so cross-panel SSO works where the principal has access.
 */
export type PanelTarget = "admin" | "customer";

export const PANEL_TARGET: PanelTarget =
  (import.meta.env.PUBLIC_PANEL_TARGET as string | undefined) === "customer" ? "customer" : "admin";

/** localStorage presence-hint key prefix (`<prefix>_authed` / `_authed_exp` / `_confirmed`). */
export const HINT_PREFIX = PANEL_TARGET === "customer" ? "tds_customer" : "tds_admin";

export const BRAND_SUFFIX = PANEL_TARGET === "customer" ? "Portal" : "Panel";

/**
 * Central login site (auth.tracht-digital.de). Logged-out/expired visitors are
 * bounced here with `?next=<absolute return URL>` instead of an in-app /login
 * page; the login site validates `next` against a *.tracht-digital.de allow-list
 * and returns them here. Override via `PUBLIC_LOGIN_URL` (e.g. the local tds-auth
 * dev server) during development.
 */
export const LOGIN_URL: string =
  (import.meta.env.PUBLIC_LOGIN_URL as string | undefined) ?? "https://auth.tracht-digital.de";
