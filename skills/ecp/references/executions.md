# Execution manifests

Executions are JSON files with extension `.ecp.json`.

## Document shape

| Field | Rule |
| ----- | ---- |
| `schema` | Required: `"@executioncontrolprotocol.execution"` |
| `version` | Required: `"2.0"` |
| `execution` | Optional: `id`, `label`, `accepts`, `returns` (object JSON Schemas) |
| `steps` | Required array of nodes (`minItems: 1`) |

`execution.id` is required to **commit** (`^[a-z0-9][a-z0-9-]{0,63}$`). Run input seeds state from `execution.accepts` property names; `execution.returns` selects result keys.

Every node has a unique `id` (`^[A-Za-z][A-Za-z0-9_-]{0,63}$`). Absent `type` means `step`.

## Complete small example

Snippets on this page use `@executioncontrolprotocol/test.echo`, a harness capability from `plugin-test` that is only available by linking it from a source checkout. Substitute any installed capability; `core.transform` is always available.

Echo, transform, markers, and gated step:

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "steps": [
    {
      "id": "seed",
      "uses": "@executioncontrolprotocol/test.echo",
      "input": { "value": "seed" },
      "as": "seed"
    },
    {
      "id": "double",
      "uses": "@executioncontrolprotocol/core.transform",
      "accepts": {
        "type": "object",
        "properties": { "text": { "type": "string" } },
        "required": ["text"]
      },
      "returns": {
        "type": "object",
        "properties": { "text": { "type": "string" } },
        "required": ["text"]
      },
      "input": { "text": { "$ref": "state.seed.echo" } },
      "script": { "lang": "js", "source": "return { text: input.text + input.text }" },
      "as": "twice"
    },
    {
      "id": "maybe",
      "uses": "@executioncontrolprotocol/test.echo",
      "expr": "(state) => state.twice.text.length > 4",
      "input": { "value": { "$ref": "state.twice.text" } },
      "as": "out"
    }
  ]
}
```

## Step (`type` omitted or `"step"`)

| Field | Notes |
| ----- | ----- |
| `uses` | Capability id `@scope/name.capability` |
| `config` | Config object id `<plugin-short>/<name>`; default `<short>/default` if present |
| `input` | Literals and markers: `$ref`, `$state`, `$script` (not `$expr`) |
| `expr` | Optional gate: skip when false |
| `accepts` / `returns` | Required on **step-contract** capabilities (transforms) |
| `script` | Plain object on transform steps (`lang`, `source` or `path`) |
| `expression` | JSONata string on expression-transform capabilities |
| `as` / `mode` | `create` (default), `replace`, `merge`, `append` |

## Branch

Each arm needs at least one step. Default arm has no `expr` and must be last:

```json
{
  "type": "branch",
  "id": "route",
  "branches": [
    {
      "label": "yes",
      "expr": "(state) => state.on === true",
      "steps": [
        {
          "id": "yes",
          "uses": "@executioncontrolprotocol/test.echo",
          "input": { "value": "yes" },
          "as": "yes"
        }
      ]
    },
    {
      "label": "default",
      "steps": [
        {
          "id": "no",
          "uses": "@executioncontrolprotocol/test.echo",
          "input": { "value": "no" },
          "as": "no"
        }
      ]
    }
  ]
}
```

Arms are tried in order; first true `expr` runs. If a key is written in only some arms (as here), later `$ref`s to it need `optional`/`fallback`.

## Loop

| `mode` | Driver | Notes |
| ------ |--------|-------|
| `while` (default) | `ref` or `expr` (boolean), before each round | `maxRounds` 1–1000 |
| `for` | `ref` or `expr` (integer), once | requires `as` (index in shared state) |
| `forEach` | `ref` or `expr` (array), once | `as`, `collect`, `into`; optional `concurrency`, `onError` |

Exactly one of `ref` (state path like `state.rows`) or `expr` on each loop node.

## Parallel

```json
{
  "type": "parallel",
  "id": "prep",
  "maxConcurrency": 2,
  "branches": [
    [
      {
        "id": "left",
        "uses": "@executioncontrolprotocol/test.echo",
        "input": { "value": "left" },
        "as": "left"
      }
    ],
    [
      {
        "id": "right",
        "uses": "@executioncontrolprotocol/test.echo",
        "input": { "value": "right" },
        "as": "right"
      }
    ]
  ]
}
```

`branches`: at least two lists; each list runs sequentially; lists run concurrently.

## Markers (value positions only)

| Marker | Use |
| ------ | --- |
| `{ "$ref": "state.path", "optional"?, "fallback"? }` | Read state |
| `{ "$state": "path" }` | Staged-write handle for capabilities |
| `{ "$script": { "lang", "source"?\|"path"?, "params"? } }` | Code passed as string input |

Node fields (`uses`, `as`, `expr`, loop `ref`, transform `script`) are **plain**, not markers.

## Hard limits

- No `$secret`, `$env`, or credentials in executions.
- Unknown properties → `ECP_MANIFEST_INVALID`.

Schema for editors: `ecp retrieve --type schema` (optionally `--include document`).