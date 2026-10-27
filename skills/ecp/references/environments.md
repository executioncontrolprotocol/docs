# Environments

An environment is a host plus installed plugins and policies. `--env <file>` is an **optional overlay**, not a required pair.

```ts
import { environment, extension, NODE_ENVIRONMENT_ID } from "@executioncontrolprotocol/node"
import jsonataExtension from "@executioncontrolprotocol/plugin-jsonata"

export default environment(NODE_ENVIRONMENT_ID, "local").with([
  extension(jsonataExtension),
])
```

Omit `--env` to use the process host (built-in Node + `ecp plugins install`). The default environment file is `~/.ecp/config/environment.ecp.ts`; `ecp environments edit` prints the path and opens it.

`env.init()` returns an **Ecp**. Call `run`, `validate`, `describe`, `search`, `invoke`, `encode`, `decode`, `patch`, `terminate` on that instance.

`.supports(environmentId, range?)` restricts a plugin to a host (`ECP_ENVIRONMENT_UNSUPPORTED` otherwise).

Layering: host always-on policies (registry-control on the CLI) → installed plugins → optional `--env` → workflow `.with()` / inferred requirements.
