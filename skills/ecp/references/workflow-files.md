# Workflow files

Author `*.ecp.ts`. Compile produces a portable manifest (`@executioncontrolprotocol.workflow`) plus a separate requirements document (`@executioncontrolprotocol.requirements`). The graph never contains secrets.

```ts
import { workflow, step, ref } from "@executioncontrolprotocol/core"
import jsonataExtension from "@executioncontrolprotocol/plugin-jsonata"
import { extension } from "@executioncontrolprotocol/core"

export default workflow("reshape-payload")
  .with([
    extension(jsonataExtension),
    extension("@executioncontrolprotocol/test"),
  ])
  .run([
    step("@executioncontrolprotocol/jsonata.transform", "Reshape")
      .with({
        expression: "{ name: payload.user.name }",
        payload: { user: { name: "Ada" } },
      })
      .as("reshape"),
    step("@executioncontrolprotocol/test.echo", "Echo")
      .with({ value: ref("reshape") })
      .as("echo"),
  ])
```

- `.with([...])` binds extensions and policies for this file.
- `.as("id")` names a step for `ref()`, `--to`, and `runs rerun --from`.
- `.requires(range, pkg?)` pins a plugin version.
- Inference fills requirements from `step("id")` when `.with()` is omitted. `@executioncontrolprotocol/test` infers `@executioncontrolprotocol/plugin-test` (not a Node default).
- `.accepts(schema)` / `.returns(schema)` declare run input and public output. Pass input with `ecp run --input`. See https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/development/examples/07-accepts-returns

`ecp install brief.ecp.ts` installs missing plugins from requirements.

Echo example: https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/development/examples/01-echo

Do not use YAML Context / `spec.yaml` / `withExtensions`.
