# Fluent authoring (ECP)

## Builders

From `@executioncontrolprotocol/core`: `workflow`, `step`, `parallel`, `branch`, `loop`, `ref`.

```ts
workflow("Label")
  .accepts({ type: "object", properties: { prompt: { type: "string" } } })
  .returns({ type: "object", properties: { brief: { type: "object" } } })
  .run([
    step("@ns/ext.cap", "Step label").with({ text: ref("prompt") }).as("brief"),
    parallel([/* … */]),
  ])
```

- `.toManifest()` — JSON workflow document
- `.accepts(schema)` / `.returns(schema)` — run input / public output JSON Schema (same verbs on `workflow` in JSON)
- Failed `accepts` throws `Workflow accepts validation failed` before execute (including `dryRun: true`); `result.output` picks `returns` keys
- Prefer JSON Schema literals (Fluent render / browser compile); Zod serializes to the same JSON
- `.toFluentSource()` / encode Fluent — manifest → TS source
- `ecp compile` — TS → JSON on CLI

## Refs and state

- `.as("name")` writes step output into run state
- `ref("name.field")` → `$ref` under state
- `ref("prompt")` reads a key declared on `.accepts()`
- `.returns()` property names are those state keys (typically `.as()`)
- Optional mode on `.as("name", { mode: "create" | … })`
- No secrets in workflow input; no `env()` / `secrets()` helpers inside portable graphs

## Manifest fields

- `schema`: `@executioncontrolprotocol.workflow`
- `version`: `"1.0"`
- Steps use `uses`, `input`, `as` (not legacy `commitAs`)
- `workflow.accepts` / `workflow.returns` — JSON Schema objects (same verbs as Fluent)
- Globally unique step `id` values (patch paths: `steps[<stepId>].field`)

## Formats

| Format | Notes |
| ------ | ----- |
| JSON | Canonical |
| Fluent | Encode in core; decode via `ecp compile` only |
| TOON | `@executioncontrolprotocol/format-toon` |
| React Flow | `@executioncontrolprotocol/format-reactflow` — Inputs/Outputs from `accepts`/`returns` |

Public guide: https://executioncontrolprotocol.io/guides/fluent-api
