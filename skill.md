---
name: execution-control-protocol
description: >-
  Builds and runs ECP (Execution Control Protocol) Fluent workflows and
  environments. Use when authoring workflow/step Fluent TypeScript, binding
  environments, using the ecp CLI, extensions, or the browser demo (Chrome AI,
  Ollama, ecp up).
---

# ECP (Execution Control Protocol)

ECP is the governed execution layer for AI agents. Author **Fluent workflows**, bind **environments**, and operate via an **Ecp** instance after `init()`.

MCP standardizes tools. ECP standardizes how execution runs under policy.

## Quick start

```ts
import { workflow, step } from "@executioncontrolprotocol/core"
import { environment, extension } from "@executioncontrolprotocol/node"
import "@executioncontrolprotocol/core/testing"

const manifest = workflow("Echo")
  .run([step("@executioncontrolprotocol/test.echo", "Echo").with({ value: "hi" }).as("echo")])
  .toManifest()

const ecp = await (await environment("dev"))
  .withExtensions([extension("@executioncontrolprotocol/test").with({})])
  .init()

await ecp.run(manifest)
```

```bash
npm install -g @executioncontrolprotocol/cli
ecp run examples/01-echo/workflow.ts --env examples/01-echo/environment.ts
ecp compile workflow.ts -o workflow.json
ecp up   # browser demo + Ollama bridge
```

## Rules for agents

- No YAML Context / `spec.yaml` / `ECPContext`
- APIs on `Ecp` after `init()`, not on the environment builder
- No secrets in workflows; catalog extensions on import
- Extensions never import node/browser/cli/mcp hosts
- Demo: https://executioncontrolprotocol.github.io/browser-demo/ — Chrome AI (nano) or Ollama via `ecp up` (coding)

## Docs map

- Fluent API: `/guides/fluent-api`
- Environments: `/guides/environments`
- Extensions: `/guides/extensions`
- CLI: `/reference/cli`
- Browser demo: `/getting-started/browser-demo`
- Providers: `/getting-started/browser-demo-providers`

For a fuller Cursor-style skill pack, see `.mintlify/skills/ecp/SKILL.md` on the docs repository.
