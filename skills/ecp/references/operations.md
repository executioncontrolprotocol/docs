# Operations

Every surface exposes the same three operations: **retrieve**, **execute**, **commit**. MCP tools use the same names and JSON schemas as the CLI (`ecp mcp start`).

## CLI mapping

| Operation | CLI | Common flags |
| --------- | --- | ------------ |
| retrieve | `ecp retrieve` | `--type`, `--id`, `--query`, `--limit`, `--include`, `--filter key=value`, `--format`, `--out`, `--json` |
| execute | `ecp execute [path\|id]` | `--validate`, `--input <json\|@file\|->`, `--no-wait`, `--resume`, `--cancel`, `--out`, `--json` |
| commit | `ecp commit` | `--type execution\|config`, `--action`, `--id`, `--object`, `--patch`, `--if-version`, `--json` |

Positional execute argument: path if it ends in `.ecp.json` or contains a separator, else stored execution id.

`--no-start-host` or `ECP_NO_START_HOST` skips auto-start (in-process fallback). Otherwise retrieve/execute/commit/plugins list start or reuse a host (idle **15 minutes**).

Host controls: `ecp host start|stop|status|restart|logs`.

## retrieve types

| `type` | Purpose |
| ------ | ------- |
| `capability` | List or get capability metadata (`accepts`/`returns`) |
| `execution` | Saved executions in `$ECP_HOME/store/executions/` |
| `config` | Config objects (`<plugin-short>/<name>`) |
| `run` | Run records; `--include steps,events,state,manifest` |
| `plugin` | Installed plugin packages |
| `formatter` | Output formatters |
| `schema` | Editor JSON Schema files |

`id` and `query` are mutually exclusive. Path-referenced `.ecp.json` files are not stored executions; read them from disk.

## execute modes

- `--validate` → validation result only (no run).
- Default run: waits for completion unless `--no-wait`.
- `--resume <runId>` / `--cancel <runId>` (mutually exclusive with a new execution).
- Stored id + inline patch: execute patched manifest without saving (see patch format).

## commit

| `type` | `action` | Notes |
| ------ | -------- | ----- |
| `execution` | create / update / delete | L0–L3 validation before save |
| `config` | create / update / delete | Plugin must be installed |

Update/delete require `--if-version`. Use `--object @file` or `--patch @file`.

## JSON Patch extension

RFC 6902 plus `@<nodeId>` under `/steps`:

```json
[
  { "op": "replace", "path": "/steps/@echo/input/value", "value": "v2" }
]
```

## MCP

`ecp mcp start` exposes exactly **retrieve**, **execute**, **commit** (stdio MCP). No secret writes through MCP.

## Runs on disk

`$ECP_HOME/runs/<runId>/` — `run.json`, `manifest.ecp.json`, `state.json`, `steps/`, `events.ndjson`, `artifacts/`.