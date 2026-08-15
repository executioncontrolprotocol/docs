---
name: ecp
description: >-
  Builds and runs ECP (Execution Control Protocol) Fluent workflows and
  environments. Use when authoring workflow(...)/step(...), binding
  environments, secrets()/keychain config, the full ecp CLI (run, validate,
  compile, encode, decode, invoke, serve, up, test, config secrets), writing
  custom withHandler extensions, or the browser demo (Chrome AI, Ollama).
---

# ECP (Execution Control Protocol)

## Mental model

| Piece | Role |
| ----- | ---- |
| **Workflow** | Portable Fluent/TS or JSON graph (`schema: "@executioncontrolprotocol.workflow"`) |
| **Environment** | Host bindings: runtime, extensions, policies, harnesses, secrets |
| **Ecp** | Operational APIs after `await env.init()` |

MCP = tools. ECP = governed execution. Do **not** use YAML Context / `ECPContext` / `spec.yaml`.

## Hello Fluent

```ts
import { workflow, step } from "@executioncontrolprotocol/core"

export default workflow("Echo test")
  .run([
    step("@executioncontrolprotocol/test.echo", "Echo")
      .with({ value: "hello" })
      .as("echo"),
  ])
```

```ts
import { environment, extension } from "@executioncontrolprotocol/node"
import "@executioncontrolprotocol/core/testing"

const env = (await environment("dev")).withExtensions([
  extension("@executioncontrolprotocol/test").with({}),
])
const ecp = await env.init()
await ecp.run(manifest)
await ecp.terminate()
```

Operational APIs (`run`, `validate`, `encode`, `decode`, `patch`, `describe`, `search`, `invoke`, `test`) live on **Ecp**, not the environment builder.

## Hard rules

- Catalog extensions on import; bind with `extension("@scope/name").with({})`
- **Secrets only via host bind** — `ecp config secrets` + `secrets("key")` in extension config; never in workflows
- Prefer **repo examples** over inventing APIs — see `references/examples.md`
- Extensions never import `node` / `browser` / `cli` / `mcp` hosts
- Call `ecp` after `init()` — not `env.run()`
- Browser demo: public URL https://executioncontrolprotocol.github.io/browser-demo/ ; source https://github.com/executioncontrolprotocol/browser-demo — do not document internal demo ops (analytics, prompt logging, private env catalogs)

## Progressive disclosure

Read sibling files when needed:

- `references/fluent.md` — Fluent authoring
- `references/environments.md` — Node env modules and ops APIs
- `references/secrets-and-config.md` — keychain + `secrets()` bind
- `references/extensions.md` — custom `withHandler` extensions
- `references/cli-ops.md` — full CLI including `ecp test`
- `references/examples.md` — GitHub example maps (fetch, don't invent)
- `references/escalation.md` — install `ecp-core` / `ecp-extensions` for monorepo work

Public docs: https://executioncontrolprotocol.io/llms.txt
