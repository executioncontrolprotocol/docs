# Fluent authoring (ECP)

## Builders

From `@executioncontrolprotocol/core`: `workflow`, `step`, `parallel`, `branch`, `loop`, `ref`.

```ts
workflow("Label")
  .run([
    step("@ns/ext.cap", "Step label").with({…}).as("alias"),
    parallel([/* … */]),
  ])
```

- `.toManifest()` — JSON workflow document
- `.toFluentSource()` / encode Fluent — manifest → TS source
- `ecp compile` — TS → JSON on CLI

## Refs and state

- `.as("name")` writes step output into run state
- `ref("name.field")` → `$ref` under state
- Optional mode on `.as("name", { mode: "create" | … })`
- No secrets in workflow input; no `env()` / `secrets()` helpers inside portable graphs

## Manifest fields

- `schema`: `@executioncontrolprotocol.workflow`
- `version`: `"1.0"`
- Steps use `uses`, `input`, `as` (not legacy `commitAs`)
- Globally unique step `id` values (patch paths: `steps[<stepId>].field`)

## Formats

| Format | Notes |
| ------ | ----- |
| JSON | Canonical |
| Fluent | Encode in core; decode via `ecp compile` only |
| TOON | `@executioncontrolprotocol/format-toon` |

Public guide: https://executioncontrolprotocol.io/guides/fluent-api
