---
name: ecp
description: >-
  Use ECP (Execution Control Protocol) to turn repeatable agent work into a JSON
  execution that a local host validates, runs, and records. Use when the user
  mentions ECP, ecp, *.ecp.json, executions, or capabilities, or when a task
  repeats, chains several capability calls, or should be checked before it
  runs. Covers discovering capabilities, writing executions (steps, branches,
  loops, parallel, transforms), validating and repairing them, running them,
  reading run records, configs and secrets, MCP, and the App. If the ecp CLI is
  not installed yet, use the ecp-setup skill first.
license: Apache-2.0
compatibility: Requires Node.js 22.12+ and the ecp CLI (npm install -g @executioncontrolprotocol/cli).
metadata:
  version: "0.60.0"
  homepage: "https://executioncontrolprotocol.io"
---

# ECP (Execution Control Protocol)

ECP lets you capture a sequence of capability calls once, as a JSON **execution** (`*.ecp.json`), and hand it to a local **host** that validates it, runs it, and records every step. Reason once; run the execution many times.

Everything goes through three operations, identical on every surface:

| Operation | CLI | MCP tool | Does |
| --------- | --- | -------- | ---- |
| retrieve | `ecp retrieve` | `retrieve` | Read capabilities, executions, configs, runs, plugins |
| execute | `ecp execute` | `execute` | Validate or run an execution; resume or cancel a run |
| commit | `ecp commit` | `commit` | Create, update, delete stored executions and configs |

## Before you start

1. `ecp --version` must print 0.60.0 or later. If `ecp` is missing or older, follow the **ecp-setup** skill.
2. Examples on disk: if `./ecp-examples/index.json` is missing, or its `ecpVersion` differs from this skill's `metadata.version`, download them (this also refreshes them after `npx skills update`):

   ```bash
   mkdir -p ecp-examples && curl -fsSL https://codeload.github.com/executioncontrolprotocol/docs/tar.gz/refs/heads/main | tar -xz --strip-components=2 -C ecp-examples docs-main/examples
   ```

   Windows PowerShell:

   ```powershell
   mkdir ecp-examples -Force; curl.exe -fsSL https://codeload.github.com/executioncontrolprotocol/docs/tar.gz/refs/heads/main -o ecp-examples.tgz; tar -xzf ecp-examples.tgz --strip-components=2 -C ecp-examples docs-main/examples; Remove-Item ecp-examples.tgz
   ```

[//]: # (examples:start)

Examples for ECP 0.60.0 (`ecp-examples/index.json` lists every file and run command):

| Example | What it shows | Plugins |
| ------- | ------------- | ------- |
| `hello` | One core.transform step: the smallest useful execution. | core only |
| `list-stats` | Run input as an object wrapping a list, and one transform that computes sum, max, and mean. | core only |
| `slug-titles` | Run input, a forEach loop with a transform per item, and collect/into. | core only |
| `control-flow` | A while loop, a for loop, a parallel node, and a branch with a default arm. | core only |
| `open-orders` | Parse a CSV file next to the execution, then filter and total the open rows. | core only |
| `reshape-items` | Reshape an items array into a title and count with one transform step. | core only |
| `jsonata-names` | Pick names from a list with a JSONata expression instead of JavaScript. | `jsonata` |
| `weekly-brief` | One model call that turns a list of signals into a short leadership brief. | `anthropic` |
| `caption` | A single model call with a fixed prompt; the smallest model-backed execution. | `anthropic` |

[//]: # (examples:end)

Start new executions by copying the closest example. Each example folder has a README with setup and run commands.

## The loop

1. **Discover.** `ecp retrieve --type capability --query "<short keywords>"`, then `ecp retrieve --type capability --id <id>` to read its `accepts` and `returns`. Never guess field names. Exception: transforms (`core.transform`, `jsonata.transform`, marked `"contract": "step"`) have no schemas of their own; the step declares `accepts` and `returns` (copy the shape from the `hello` or `list-stats` example).
2. **Write** a `*.ecp.json` file. Start small (one or two steps) and grow it.
3. **Validate.** `ecp execute flow.ecp.json --validate --json`. Fix each issue by `path` (JSON Pointer into the file), `code`, `suggestions`, and `available` (valid state paths). Repeat until `valid`.
4. **Run.** `ecp execute flow.ecp.json --input '{...}' --json`. When running, always pass `--input` (use `'{}'` when there is none) so `accepts` defaults apply. Run input is always a JSON **object** keyed by `execution.accepts` properties: wrap a list as `{"numbers": [3, 9, 4]}`.
5. **Inspect.** On `status: "failed"`, read `data.error` (it names the `nodeId`; provider errors carry `details.status` and `details.body`). More: `ecp retrieve --type run --id <runId> --include steps`.
6. **Save.** When it works, give it `execution.id` and `ecp commit --type execution --action create --object @flow.ecp.json`. Later updates: `--action update --id <id> --object @file --if-version <n>`.

`--json` prints `{ "ok": true, "data": ... }` or `{ "ok": false, "error": { "code", "message", "path", "suggestions", "issues" } }`. A failed **run** is still `ok: true` with `data.status: "failed"`. Exit codes: 0 ok, 1 run failed, 2 invalid request or execution, 3 plugin missing, 4 host unavailable.

## Execution cheat sheet

```json
{
  "schema": "@executioncontrolprotocol.execution",
  "version": "2.0",
  "execution": {
    "id": "my-flow",
    "accepts": { "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] },
    "returns": { "type": "object", "properties": { "hello": { "type": "object" } } }
  },
  "steps": [
    {
      "id": "greet",
      "uses": "@executioncontrolprotocol/core.transform",
      "accepts": { "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] },
      "returns": { "type": "object", "properties": { "greeting": { "type": "string" } }, "required": ["greeting"] },
      "input": { "name": { "$ref": "state.name" } },
      "script": { "lang": "js", "source": "return { greeting: `Hello, ${input.name}!` }" },
      "as": "hello"
    }
  ]
}
```

- **Document:** `schema` and `version` are constants. `execution.accepts` property names become state keys (run input); `execution.returns` picks the result keys. `execution.id` (`^[a-z0-9][a-z0-9-]{0,63}$`) is needed to commit. Unknown fields are errors.
- **Step:** `id` (unique in the whole file), `uses` (capability id), `input`, `as` (state key for the output), optional `mode` (`create` default, `replace`, `merge`, `append`), `expr` gate, `config` id, `label`.
- **State:** read with `{ "$ref": "state.key.path.0" }`. A value that may be missing (gated step, one branch arm) needs `"optional": true` and usually a `"fallback"`.
- **Markers** (`$ref`, `$state`, `$script`) only appear inside `input` values. Node fields (`uses`, `as`, `expr`, loop `ref`) are plain.
- **Never** put secrets, `$secret`, or `$env` in an execution.

### Control flow

```json
{ "type": "branch", "id": "route", "branches": [
  { "label": "big", "expr": "(state) => state.count > 10", "steps": [ ... ] },
  { "label": "default", "steps": [ ... ] } ] }
```

```json
{ "type": "loop", "id": "refine", "expr": "(state) => state.draft.score < 0.8", "maxRounds": 3, "steps": [ ... ] }
{ "type": "loop", "mode": "for", "id": "repeat", "ref": "state.count", "as": "i", "steps": [ ... ] }
{ "type": "loop", "mode": "forEach", "id": "each", "ref": "state.rows", "as": "row", "steps": [ ... ],
  "collect": "state.item", "into": "results", "concurrency": 4, "onError": "continue" }
```

```json
{ "type": "parallel", "id": "both", "branches": [ [ ...nodes... ], [ ...nodes... ] ] }
```

- Branch: first arm whose `expr` is true runs; an arm without `expr` is the default and must be last.
- `while` (default): `maxRounds` 1 to 1000 required. Inside `while`/`for` bodies use `replace`/`merge`/`append`, not `create`.
- `forEach`: each item runs on its own copy of state with `state.<as>` and `state.<as>Index`; `collect` is read per item; `state.<into>` gets the results in order. Drive it with `ref` (typed), not `expr`.
- Parallel lines can't read each other's outputs or write the same key.
- `expr` is one JS function `(state) => boolean`, sandboxed, 50 ms. **Control only**: never compute data with it.

### Transforms (reshaping data)

Reshape data with a transform **step**, never inline. `@executioncontrolprotocol/core.transform` is always installed: the step declares `accepts` and `returns` (both `type: "object"` with `properties`), binds inputs with `$ref`, and has a plain `script` (`{ "lang": "js", "source": "..." }` or `"path": "scripts/x.js"` relative to the file). The script reads `input` and `return`s an object; it can't access files, network, or state directly. Limits: 1000 ms, 32 MiB.

JSONata alternative (`ecp plugins install jsonata`): `"uses": "@executioncontrolprotocol/jsonata.transform"` with `"expression": "{ \"names\": people.name[] }"` instead of `script`.

`$script` in `input` is different: it passes code **as a string** to a capability that runs it elsewhere (`{ "$script": { "lang": "js", "path": "x.js", "params": { ... } } }`).

### Files

Files are JSON references: `{ "kind": "file", "path": "data.csv", "mediaType": "text/csv" }`, `{ "kind": "url", "url": "https://..." }`, or run artifacts. Relative paths resolve from the execution file's folder. Output files are captured into the run automatically. A URL-only input needs a publish step first (`ECP_TYPE_MISMATCH` says so).

## Configs and secrets

Plugins that need settings use a config object, committed once:

```json
{ "schema": "@executioncontrolprotocol.config", "version": "1.0", "id": "anthropic/default",
  "plugin": "@executioncontrolprotocol/anthropic",
  "values": { "model": "claude-sonnet-4-5", "apiKey": { "$secret": "anthropic.apiKey" } } }
```

```bash
ecp commit --type config --action create --object @anthropic.default.json
ecp config secrets set anthropic.apiKey      # the USER runs this and types the value
```

A step uses `<plugin>/default` automatically, or `"config": "<plugin>/<name>"`. Read a plugin's config schema with `ecp retrieve --type capability --id <capability>` (`configSchema`). Secret values live in the OS keychain (or `ECP_SECRET_<KEY>` env vars in CI) and never pass through MCP, executions, or chat.

## Plugins

`ecp plugins` lists what is installed. The core plugin (`core.transform`, `core.parse-csv`) is bundled. Install others with `ecp plugins install <short-name or npm package>`, then `ecp host stop` so your next command starts a fresh host that has them (the running host reloads in the background, and a command sent too soon can still fail with `ECP_PLUGINS_MISSING`). A missing first-party plugin fails validation with `ECP_PLUGINS_MISSING` and the exact install command. First-party plugins: https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/main/plugins

## Host, MCP, App

- The host starts on demand and stops after 15 idle minutes. `ecp host status`, `ecp host logs`, `ecp host restart`.
- MCP: `ecp mcp start` (stdio) exposes exactly `retrieve`, `execute`, `commit`. Their JSON matches the CLI operations; pass `execution: { "path": "flow.ecp.json" }` and `mode: "validate"` to validate.
- App: `ecp app flow.ecp.json` opens a live graph that reloads when the file changes. Suggest it so the user can watch your edits.

## Errors: what to do

| Code | Action |
| ---- | ------ |
| `ECP_CAPABILITY_UNKNOWN` | Use the suggested id, or search with `retrieve` |
| `ECP_PLUGINS_MISSING` | Run the `ecp plugins install` command from the message (first-party; tell the user) |
| `ECP_INPUT_INVALID` | Compare `input` with `expected` / the capability's `accepts` |
| `ECP_REF_UNRESOLVED` / `ECP_REF_PATH_INVALID` | Pick a path from `available` or the suggestion; fix step order |
| `ECP_REF_MAYBE_MISSING` | Add `"optional": true` and a `"fallback"` |
| `ECP_TYPE_MISMATCH` | Add a transform step, or a publish step for files |
| `ECP_COMMIT_CONFLICT` | Use `replace`/`merge`/`append`, or a different `as` |
| `ECP_EXPR_INVALID` / `ECP_SCRIPT_INVALID` | Fix syntax at `line`/`column`; move data logic into a transform |
| `ECP_CONFIG_UNKNOWN` / `ECP_CONFIG_INVALID` | Create or fix the config object |
| `ECP_SECRET_MISSING` | **Stop.** Ask the user to run `ecp config secrets set <key>` |
| `ECP_STEP_FAILED` / `ECP_PROVIDER_ERROR` | Read `error.message` and `error.details`; fix input or config; auth and quota problems go to the user |
| `ECP_OUTPUT_INVALID` / `ECP_SCRIPT_FAILED` | Fix the transform script or its `returns` |
| `ECP_VERSION_CONFLICT` | Re-read the object, reapply the change, retry with the current version |
| `ECP_HOST_UNAVAILABLE` | `ecp host logs`; `ecp host start` |

## Ask the user first

- Before installing any third-party (non `@executioncontrolprotocol`) plugin.
- Whenever a secret is needed. Never ask them to paste it into the chat or a file.
- Before `commit --action delete`, or updating a saved execution someone else owns.
- Before resuming (`ecp execute --resume <runId>`) a run whose interrupted step has side effects (uploads, messages, payments).

## Full documentation

Every page is available as Markdown: append `.md` to its URL. Index: https://executioncontrolprotocol.io/llms.txt

- Execution manifest: https://executioncontrolprotocol.io/guides/executions.md
- Control flow: https://executioncontrolprotocol.io/guides/control-flow.md
- Transforms: https://executioncontrolprotocol.io/guides/transforms-and-scripts.md
- Operations and patches: https://executioncontrolprotocol.io/reference/operations.md
- Error codes: https://executioncontrolprotocol.io/reference/error-codes.md
- Write a plugin: https://executioncontrolprotocol.io/guides/writing-a-plugin.md
