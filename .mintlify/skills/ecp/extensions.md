# Extensions (ECP skill)

## Pattern

1. `defineExtension(ns, name).withCapabilities([...]).build()`
2. `catalogExtension(def)` at module load
3. Consumer: `import "@scope/name"` then `extension("@scope/name").with({})`
4. Invoke: `step("@scope/name.capability", "Label").with({…}).as("id")`

npm package name should match extension id.

## Boundaries

Depend on `@executioncontrolprotocol/types` + `@executioncontrolprotocol/core` only.

Never import `@executioncontrolprotocol/node`, `browser`, `cli`, or `mcp` from an extension.

## Formats

- JSON / Fluent encode: core
- TOON: `@executioncontrolprotocol/format-toon`
- Encode/decode/patch results use `.result` (not `.content` / `.document`)

## Test stub

```ts
import "@executioncontrolprotocol/core/testing"
extension("@executioncontrolprotocol/test").with({})
```
