# Environments

An environment is a host plus installed plugins and policies. Optional `config.ecp.ts` holds machine settings. It does not define the catalog.

```ts
import { config, extension, policy, secrets } from "@executioncontrolprotocol/core"

export default config().with([
  extension("@executioncontrolprotocol/anthropic").with({
    apiKey: secrets("anthropic/api-key"),
  }),
])
```

Omit `--config` to use the process host (built-in Node + `ecp plugins install`). When `~/.ecp/config/config.ecp.ts` exists, it is merged on top. `ecp config edit` prints the path and opens it.

`env.init()` returns an **Ecp**. Call `run`, `validate`, `describe`, `search`, `invoke`, `encode`, `decode`, `patch`, `terminate` on that instance.

`.supports(environmentId, range?)` restricts a plugin to a host (`ECP_ENVIRONMENT_UNSUPPORTED` otherwise).

Layering: host always-on policies (registry-control on the CLI) → installed plugins → optional `config.ecp.ts` / `--config` → workflow `.with()` / inferred requirements.
