# Dogfood workflows

Three tasks used to prove this skill. Fixtures live in the ECP repo under `reset/dogfood/` on `milestone/cli-reset`. Copy the shape; do not invent old `ecp test` sessions.

## 1. JSONata reshape

Plugins: `jsonata`. Injected failure: wrong JSONata path → `ECP_STEP_FAILED`.

```ts
import { workflow, step } from "@executioncontrolprotocol/core"

export default workflow("dogfood-reshape").run([
  step("@executioncontrolprotocol/jsonata.transform", "Reshape")
    .with({
      expression: "{ title: payload.items[0].title, count: $count(payload.items) }",
      payload: { items: [{ title: "Widget" }, { title: "Gadget" }] },
    })
    .as("summary"),
])
```

Fix the expression if it points at a missing field, then `ecp run --json` again.

## 2. Resize, upload, approve

Plugins: `image-sharp`, `azure-blob-storage`, `approval`. Injected failure: wrong `ref()` on upload → `ECP_INPUT_INVALID`.

Sequence: resize a product photo → upload with approval → return a share URL. Wire `ref("resize")` (or the actual `.as()` id) into the upload input. Secrets stay as `secrets("key")`.

## 3. Caption and Mermaid

Plugins: `anthropic` **or** `ollama`, `format-mermaid`. Injected failure: plugin not installed → `ECP_PLUGINS_MISSING`.

Generate a caption with a model step, then `ecp format-mermaid encode --input <file>`. If encode fails with `ECP_PLUGINS_MISSING`, install `format-mermaid` (first-party; no extra approval) and retry.

Prefer Ollama when no paid API key is available.
