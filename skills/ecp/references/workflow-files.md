# Workflow files

Author `*.ecp.ts`. Compile produces a portable manifest (`@executioncontrolprotocol.workflow`) plus a separate requirements document (`@executioncontrolprotocol.requirements`). The graph never contains secrets.

Import only `@executioncontrolprotocol/core` and relative files. The global CLI resolves `core` — no local `npm install` of `core`, `zod`, or plugin packages in the workflow folder.

```ts
import { workflow, step, ref, extension } from "@executioncontrolprotocol/core"

export default workflow("reshape-payload")
  .with([extension("@executioncontrolprotocol/jsonata")])
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

- `.with([...])` binds extensions and policies by **string id** (install plugins with the CLI; do not import `@executioncontrolprotocol/plugin-*` in the workflow file).
- `.as("id")` names a step for `ref()`, `--to`, and `runs rerun --from`.
- `.requires(range, pkg?)` pins a plugin version.
- Inference fills requirements from `step("id")` when `.with()` is omitted.
- `.accepts(schema)` / `.returns(schema)` take JSON Schema objects (do not import `zod`). Pass input with `ecp run --input`. See https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/development/examples/07-accepts-returns

```bash
ecp workflows init brief
ecp workflows validate brief.ecp.ts
ecp workflows install brief.ecp.ts
ecp run brief.ecp.ts
```

`ecp workflows validate` checks capability ids and input keys. Secrets are needed to run, not to validate.

Optional editor setup: `ecp workflows init brief --tsconfig` writes a `tsconfig.json` that points at `~/.ecp/cache/types`. Refresh with `ecp workflows types` after `plugins link` / `unlink` / `update` / `uninstall`. `ecp plugins install` refreshes that cache automatically.

Echo example: https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/development/examples/01-echo

Do not use YAML Context / `spec.yaml` / `withExtensions`.
