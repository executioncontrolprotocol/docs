# Plugins

Capabilities come from installed plugins. The **core** plugin is bundled; other first-party packages install from npm.

## User commands

```bash
ecp plugins
ecp plugins install <short|@scope/package|tarball>
ecp plugins link [path]
ecp plugins uninstall <package>
ecp plugins update
ecp plugins reset
ecp plugins inspect <package>
```

- Short names (`jsonata`) resolve to `@executioncontrolprotocol/<short>`; third-party plugins install by full npm name.
- Missing first-party plugin for a `uses` → `ECP_PLUGINS_MISSING` with `ecp plugins install <short>` (exit **3**).
- Unknown plugin → `ECP_CAPABILITY_UNKNOWN`.

First-party plugin packages live in the monorepo under `plugins/` on the `development` branch:
https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/development/plugins

Discover capabilities after install:

```bash
ecp retrieve --type capability --query "<keyword>"
ecp retrieve --type capability --id @executioncontrolprotocol/core.transform
```

## Linking local plugins

For development, `ecp plugins link /path/to/package` registers the package under `$ECP_HOME/plugins/`. The host restarts when the plugin marker changes.

## Authoring (when the user asks to build a plugin)

Use `@executioncontrolprotocol/plugin-sdk`:

```ts
import { definePlugin, capability } from "@executioncontrolprotocol/plugin-sdk"
import { z } from "zod"

export default definePlugin({
  id: "@acme/my-plugin",
  config: z.object({ apiKey: z.string().optional() }),
  capabilities: {
    "do-work": capability({
      summary: "…",
      useCases: ["…"],
      projections: ["…"],
      accepts: z.object({ text: z.string() }),
      returns: z.object({ text: z.string() }),
      handler: () => import("./capabilities/do-work.js"),
    }),
  },
})
```

The plugin id must equal the package `name`. Keep zod schemas in their own module and type handlers with `HandlerContext` plus `z.infer` (importing the capability definition into its own handler creates a circular type). Full walkthrough: https://executioncontrolprotocol.io/guides/writing-a-plugin

Build with `tsc && ecp-plugin-manifest` so `ecp.manifest.json` and `ecp.schema.json` ship beside `dist/`. Handlers load lazily via `handler: () => import("…")`.

Do not document vendor-specific capability catalogs here; retrieve metadata per id.

## Agent rules

- Ask before `ecp plugins install` for third-party or unfamiliar packages.
- Do not uninstall the bundled core plugin.