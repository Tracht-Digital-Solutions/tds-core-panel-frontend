/// <reference types="astro/client" />

// The three virtual modules frontend-contract's Astro integration serves. Declared
// here so the shell type-checks against them.
declare module "virtual:panel-registry" {
  import type { ComposedRegistry } from "@tracht-digital-solutions/tds-frontend-contract";
  export const registry: ComposedRegistry;
}

declare module "virtual:panel-widgets" {
  import type { WidgetManifest } from "@tracht-digital-solutions/tds-frontend-contract";
  // Component is the resolved (Astro) component; typed loosely — the host just
  // renders it. Metadata rides along for permission gating + titles.
  export const widgets: Array<WidgetManifest & { Component: unknown }>;
}

declare module "virtual:panel-settings" {
  import type { SettingsPanel } from "@tracht-digital-solutions/tds-frontend-contract";
  export const settings: Array<SettingsPanel & { Component: unknown }>;
}
