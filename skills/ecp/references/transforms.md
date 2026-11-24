# Transforms

Reshape data with **steps**, never with control `expr` or hidden input expressions.

## `@executioncontrolprotocol/core.transform`

Bundled with the host. Capability contract is `step`: declare `accepts` and `returns` on the step.

- Bind inputs with `$ref` in `input`.
- Provide **`script`** as a plain step field (not a `$script` marker):

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "execution": {
    "accepts": {
      "type": "object",
      "properties": { "name": { "type": "string" } },
      "required": ["name"]
    }
  },
  "steps": [
    {
      "id": "pack",
      "uses": "@executioncontrolprotocol/core.transform",
      "accepts": {
        "type": "object",
        "properties": { "name": { "type": "string" } },
        "required": ["name"]
      },
      "returns": {
        "type": "object",
        "properties": { "greeting": { "type": "string" } },
        "required": ["greeting"]
      },
      "input": { "name": { "$ref": "state.name" } },
      "script": {
        "lang": "js",
        "source": "return { greeting: 'Hello, ' + input.name }"
      },
      "as": "hello"
    }
  ]
}
```

The host runs `script` in QuickJS (no I/O; 1000 ms, 32 MiB, 4 MiB result by default) and validates the result against the step `returns`. `returns` must be `type: "object"` with `properties`.

Use `path` instead of `source` for file-backed scripts (relative to the execution file directory).

## `@executioncontrolprotocol/jsonata.transform` (optional plugin)

Install with `ecp plugins install jsonata` when needed (first-party; no approval prompt needed, but mention it to the user). Step contract is `step` with `code: "expression"`:

- Set step-level `expression` (JSONata string), not `script`.
- Same `accepts` / `returns` / `input` / `as` pattern as core transforms.

## `$script` in `input` (not a transform)

`$script` is a **value marker** for passing JavaScript source into a capability input that expects a string (code a remote service runs). The host syntax-checks it and passes `const params = <JSON>;\n<script>` as the string; ECP never runs it. Example below uses `test.echo` from `plugin-test` (source checkouts only); in practice the target is a capability whose `accepts` has a string field for code.

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "steps": [
    {
      "id": "pass",
      "uses": "@executioncontrolprotocol/test.echo",
      "input": {
        "value": {
          "$script": {
            "lang": "js",
            "source": "return 1;"
          }
        }
      },
      "as": "out"
    }
  ]
}
```

Do not use `$script` on the step's transform `script` field; transforms use the plain `script` object.

## Validation hints

| Issue | Fix |
| ----- | --- |
| `accepts`/`returns` on non-step capability | Remove or pick a transform capability |
| `$expr` in `input` | Add a transform step and `$ref` the output |
| `ECP_SCRIPT_INVALID` on transform | Fix `source`/`path`; one of them required |
| Output shape mismatch | Match `returns` schema or fix the script |