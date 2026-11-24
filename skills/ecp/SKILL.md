---
name: ecp
description: >-
  Operates ECP (Execution Control Protocol): discover capabilities, write
  *.ecp.json executions, validate and run them with retrieve/execute/commit
  (CLI or MCP), read run records, and save working executions. Use when work is
  repeatable, moves data between several capability calls, or must be checked
  before it runs. Do not use for a single one-off tool call, or for legacy
  Fluent *.ecp.ts workflows (removed).
---

# ECP (Execution Control Protocol)

You delegate repeatable work to a **JSON execution graph** the host runs deterministically. Author `.ecp.json`, validate, fix structured issues, run, inspect runs, commit when stable. Learn flags from `ecp <command> --help`; do not copy CLI tables here.

Install CLI: `npm install -g @executioncontrolprotocol/cli`. Install this skill: `npx skills add executioncontrolprotocol/docs`.

## When to delegate

Use ECP when work is **repeatable, plugin-backed, or must be repaired from validation/run output**. Skip it for a single throwaway call or pure chat reasoning. MCP (`ecp mcp start`) and the App (`ecp app`) expose the same three operations as the CLI.

## Loop

1. `ecp retrieve --type capability --query "<intent>"` or `--id @scope/plugin.capability`
2. Write or edit `*.ecp.json` (`schema` + `version: "2.0"` + `steps`)
3. `ecp execute path.ecp.json --validate --json`
4. On `ok: false`, fix using `error.path`, `error.code`, `error.suggestions`, and `issues[]` / `available`
5. `ecp execute path.ecp.json --input '{"..."}' --json` (add `--no-wait` to poll the run)
6. `ecp retrieve --type run --id <runId> --include steps,events,state`
7. When stable: `ecp commit --type execution --action create --object @file` (needs `execution.id`); later updates add `--action update --id <id> --if-version <n>`

Envelope: `{ ok: true, data }` or `{ ok: false, error: { code, message, path?, suggestions?, issues? } }`. A **failed run** is still `ok: true` with `data.status: "failed"`.

## Hard rules

- No secret values, `$secret`, or `$env` in executions; bind secrets in **config objects** (see `references/configs-and-secrets.md`).
- `expr` is **control only** (gates, branches, loops); never `$expr` in `input`.
- Data reshaping is a **transform step** (`core.transform` or optional JSONata), not inline expressions.
- `ecp plugins install` for third-party packages: **ask the user first**.
- Transforms and capabilities need installed plugins; first-party gaps return `ECP_PLUGINS_MISSING` with an install hint.

## Error codes (agent action)

| Code | Action |
| ---- | ------ |
| `ECP_REQUEST_INVALID` | Fix CLI/MCP flags or operation input |
| `ECP_EXECUTION_LOAD` | Fix path, JSON, `schema`, or `version` |
| `ECP_NOT_FOUND` | Fix id; use `retrieve --query` for suggestions |
| `ECP_MANIFEST_INVALID` | Walk `issues[]`; fix paths in the file |
| `ECP_CAPABILITY_UNKNOWN` | Install correct plugin or fix `uses` |
| `ECP_PLUGINS_MISSING` | Run suggested `ecp plugins install <short>`; ask if not first-party |
| `ECP_INPUT_INVALID` | Fix `input` vs capability or step `accepts` |
| `ECP_REF_*` | Fix `$ref` paths, `optional`/`fallback`, or ordering |
| `ECP_COMMIT_CONFLICT` | Fix `mode`/`as`; avoid `create` inside shared loops |
| `ECP_EXPR_INVALID` / `ECP_SCRIPT_INVALID` | Fix syntax; no `$expr` in inputs |
| `ECP_CONFIG_UNKNOWN` / `ECP_CONFIG_INVALID` | Fix `config` id or config object |
| `ECP_PATCH_INVALID` | Fix JSON Patch or `@nodeId` paths |
| `ECP_ALREADY_EXISTS` / `ECP_VERSION_CONFLICT` | Use update + `ifVersion` or new id |
| `ECP_SECRET_MISSING` | **Stop.** User runs `ecp config secrets set <key>` |
| `ECP_STEP_FAILED` / `ECP_OUTPUT_INVALID` | Read step error; fix input or capability usage |
| `ECP_EXPR_*` / `ECP_SCRIPT_*` (run-time) | Fix `expr` or transform `script` |
| `ECP_PROVIDER_ERROR` | Read the failed step's `error.details` (`status`, `body`) in the run; fix input/config, or escalate auth and quota problems |
| `ECP_PLUGIN_LOAD_FAILED` | Plugin is broken or half-installed; tell the user (`ecp plugins`, `ecp host logs`) |
| `ECP_RUN_CANCELLED` | Expected after `--cancel`; do not treat as bug |
| `ECP_HOST_RESTARTING` | Retry after `retryAfterMs` |
| `ECP_HOST_UNAVAILABLE` / `ECP_UNAUTHORIZED` | `ecp host status`; check token and logs |

Full catalogue: `references/errors.md`. Exits: `0` success (including valid `--validate`), `1` failed run/internal, `2` invalid request/manifest, `3` missing plugins, `4` host unavailable.

## References

- `references/executions.md` — manifest and node kinds
- `references/transforms.md` — `core.transform`, JSONata, `$script` in inputs
- `references/operations.md` — retrieve / execute / commit (CLI + MCP)
- `references/configs-and-secrets.md`
- `references/plugins.md`
- `references/errors.md`
- `references/examples.md` — small verified manifests
- `references/escalation.md`