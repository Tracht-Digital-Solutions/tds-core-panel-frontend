import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { panelHost } from "@tracht-digital-solutions/tds-panel-contract/astro";
// Shared CSS minify settings (the cssTarget that keeps lightningcss from
// dropping the .brand-header backdrop-filter prefix). See tds-shared#10.
import { tdsViteBuild } from "@tracht-digital-solutions/tds-shared/astro";

// Enabled extensions for THIS product target (admin). The customer target is a
// second config with a different extension list. panelHost composes them at
// build time: injects each route + exposes the registry / widgets / settings
// virtual modules. A conflict or missing dependency fails the build here.
import timeTracker from "@tracht-digital-solutions/tds-ext-time-tracker";
import supportTickets from "@tracht-digital-solutions/tds-ext-support-tickets";
import websiteCms from "@tracht-digital-solutions/tds-ext-website-cms";

export default defineConfig({
  output: "static",
  integrations: [react(), panelHost({ extensions: [timeTracker, supportTickets, websiteCms] })],
  trailingSlash: "ignore",
  build: { format: "directory" },
  vite: { build: { ...tdsViteBuild } },
});
