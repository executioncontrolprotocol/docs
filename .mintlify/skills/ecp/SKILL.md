---
name: ecp
description: >-
  Builds and runs ECP (Execution Control Protocol) Fluent workflows and
  environments. Use when authoring workflow(...)/step(...), binding
  environments, using the ecp CLI (run, validate, compile, encode, decode, up),
  writing extensions, or working with the browser demo (Chrome AI, Ollama).
---

# ECP (Execution Control Protocol)

## Mental model

| Piece | Role |
| ----- | ---- |
| **Workflow** | Portable Fluent/TS or JSON graph (`schema: "@executioncontrolprotocol.workflow"`) |
| **Environment** | Host bindings: runtime, extensions, policies, harnesses |
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

Operational APIs (`run`, `validate`, `encode`, `decode`, `patch`, `describe`, `search`) live on **Ecp**, not the environment builder.

## CLI cheat sheet

```bash
ecp run workflow.ts --env environment.ts
ecp validate workflow.ts --env environment.ts
ecp compile workflow.ts -o workflow.json
ecp describe --env environment.ts
ecp search "echo" --env environment.ts
ecp encode workflow.json --format toon --env environment.ts -o workflow.toon
ecp encode workflow.json --format fluent --env environment.ts -o workflow.generated.ts
ecp decode workflow.toon --format toon --env environment.ts -o workflow.json
ecp up
ecp config secrets add KEY
```

Fluent decode is unsupported — use `ecp compile`.

## Do / don't

**Do**

- Catalog extensions on import; bind with `extension("@scope/name").with({})`
- Keep secrets out of workflows; use host secrets / browser vault
- Use `ref("step.field")` for portable state
- Treat Fluent API docs as the authoring spec

**Don't**

- Import `node` / `browser` / `cli` / `mcp` from extension packages
- Put demo `ProviderMode` types into `@executioncontrolprotocol/browser`
- Reintroduce YAML Context manifests
- Call `env.run()` — use `ecp` after `init()`

## Browser demo

- Live: https://executioncontrolprotocol.github.io/browser-demo/
- First-run selectable: **Chrome AI** (nano/EQL) and **Ollama** (coding/Fluent via `ecp up`)
- OpenAI/Claude may be in deps but are not first-run selectable today
- Runtime host ≠ demo app — apps bind harnesses and providers

## Progressive disclosure

Read sibling files in this skill folder when needed:

- `fluent.md` — Fluent authoring details
- `cli.md` — CLI flags and `ecp up`
- `extensions.md` — catalog, boundaries, formats

Public docs: `/guides/fluent-api`, `/reference/cli`, `/guides/extensions`.
