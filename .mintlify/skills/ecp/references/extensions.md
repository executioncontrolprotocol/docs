# Extensions (ECP)

## Catalog and bind (consumer)

```ts
import "@executioncontrolprotocol/format-toon"
import { extension } from "@executioncontrolprotocol/node"

extension("@executioncontrolprotocol/format-toon").with({})
```

Prefer **npm package name === extension id** when possible. Invoke with `step("@scope/name.capability", "Label").with({…}).as("id")`.

## Custom extension (app customization)

Capability bodies are **inline TypeScript handlers** via `.withHandler(...)`:

```ts
import {
  defineExtension,
  capabilityFor,
  catalogExtension,
} from "@executioncontrolprotocol/core"
import { z } from "zod"

export const myExtension = defineExtension("@vendor", "my-ext")
  .withConfig({ apiKey: z.string().optional() })
  .withCapabilities([
    capabilityFor("@vendor/my-ext", "do-thing")
      .withInput(z.object({ value: z.string() }))
      .withOutput(z.object({ result: z.string() }))
      .withHandler(async (input) => ({ result: input.value })),
  ])
  .build()

catalogExtension(myExtension)
```

Then bind `extension("@vendor/my-ext").with({})` and invoke `step("@vendor/my-ext.do-thing", "…").with({ value: "hi" })`.

## Boundaries

Depend on `@executioncontrolprotocol/types` + `@executioncontrolprotocol/core` (+ focused third-party libs / `zod`).

Never import `@executioncontrolprotocol/node`, `browser`, `cli`, or `mcp` from an extension package.

## Browser vs Node package graphs

Execution is `local` | `host` | `mixed` (dispatch). Bundler conditions are `browser` | `node` | `import` (package.json `exports`). Do not rename one to match the other.

If Node code imports native/SDK deps, add `exports["."].browser` pointing at a catalog entry (`index.browser.ts`) with **no** `sharp` / Azure SDK / `node:fs`. Consumers import the package name only; Vite picks `browser`.

Host caps: catalog in the tab, hop at run. Mixed: tab-safe handler + nested host hops.

## Test stub

```ts
import "@executioncontrolprotocol/core/testing"
extension("@executioncontrolprotocol/test").with({})
```

## Vendor packages

Vendor integrations live in https://github.com/executioncontrolprotocol/extensions — install skill `ecp-extensions` for monorepo authoring.

Public guide: https://executioncontrolprotocol.io/guides/extensions
