# Environments (ECP)

Workflows stay portable. Environments hold host bindings.

## Node environment module

```ts
import { environment, extension } from "@executioncontrolprotocol/node"
import "@executioncontrolprotocol/core/testing"
import "@executioncontrolprotocol/format-toon"

export default (await environment("echo-dev", "Echo development")).withExtensions([
  extension("@executioncontrolprotocol/test").with({}),
  extension("@executioncontrolprotocol/format-toon").with({}),
])
```

| Method | Role |
| ------ | ---- |
| `.withRuntime(…)` | Override or set runtime |
| `.withExtensions([...])` | Bind cataloged extensions |
| `.withPolicies([...])` | Bind policies |
| `.withHarnesses([...])` | Bind harnesses (common in browser apps) |
| `.init()` | Return operational **Ecp** |

Import extension packages for catalog registration before string bindings.

## Operational APIs on Ecp

```ts
const ecp = await env.init()
await ecp.describe()
await ecp.search("echo")
await ecp.validate(manifest)
await ecp.run(manifest, { input: { value: "hello" } })
await ecp.invoke("@executioncontrolprotocol/test.echo").with({ value: "hi" }).process()
await ecp.test(manifest).with({ input: {} }).start()
await ecp.encode(source).uses("@executioncontrolprotocol/format-toon").to("@executioncontrolprotocol.workflow").process()
await ecp.terminate()
```

`ecp.validate()` is graph and environment only. Run input is checked against `workflow.accepts` on `ecp.run` (and `--dry-run`).

Encode / decode / patch results use `.result` (not `.content` / `.document`).

## Browser hosts

`@executioncontrolprotocol/browser` is a slim host (executor, registry, session). Apps bind providers and harnesses. Public demo: https://executioncontrolprotocol.github.io/browser-demo/ — source: https://github.com/executioncontrolprotocol/browser-demo

## Secrets

See `secrets-and-config.md`. Bind credentials in extension `.with({…})`, never in workflows.

Public guide: https://executioncontrolprotocol.io/guides/environments
