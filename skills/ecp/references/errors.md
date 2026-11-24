# Error codes

Failure envelope: `{ ok: false, error: { code, message, path?, suggestions?, issues?, retryAfterMs? } }`.

Run failures appear under `data.error` with `ok: true` on execute.

## Operation and validation (exit 2 unless noted)

| Code | When | Agent action |
| ---- | ---- | ------------- |
| `ECP_REQUEST_INVALID` | Operation input invalid | Fix flags and JSON per `ecp <cmd> --help` |
| `ECP_EXECUTION_LOAD` | Bad file, JSON, `schema`, or `version` | Fix path and document header |
| `ECP_NOT_FOUND` | Unknown id | Use `retrieve --query`; fix id |
| `ECP_MANIFEST_INVALID` | L0–L3 validation | Fix each `issues[]` entry |
| `ECP_CAPABILITY_UNKNOWN` | `uses` not installed/known | Install plugin or fix id |
| `ECP_PLUGINS_MISSING` | Known first-party plugin missing | `ecp plugins install <short>`; ask if not first-party (exit **3**) |
| `ECP_INPUT_INVALID` | Run or step input vs schema | Fix `input` or run `--input` |
| `ECP_REF_UNRESOLVED` | `$ref` target missing | Fix producer `as` or order |
| `ECP_REF_MAYBE_MISSING` | Optional path without `optional`/`fallback` | Add `optional` or `fallback` |
| `ECP_REF_PATH_INVALID` | Path not in producer schema | Fix path segments |
| `ECP_TYPE_MISMATCH` | Value type does not fit target | Fix binding or transform |
| `ECP_COMMIT_CONFLICT` | Duplicate writers / `create` in shared loop | Fix `mode`; restructure loop |
| `ECP_RETURNS_UNRESOLVED` | `execution.returns` key missing | Add step or fix `returns` |
| `ECP_EXPR_INVALID` | Bad `expr` or `$expr` in input | Fix function syntax; remove `$expr` |
| `ECP_SCRIPT_INVALID` | Bad `$script` or transform `script` | Fix syntax, file path, source/path |
| `ECP_CONFIG_UNKNOWN` | Config id missing | Create config or fix `config` on step |
| `ECP_CONFIG_INVALID` | Config fails plugin schema | Fix `values` |
| `ECP_PATCH_INVALID` | Patch or `@nodeId` failed | Fix op path and index |
| `ECP_ALREADY_EXISTS` | Create on existing id | Use update or new id |
| `ECP_VERSION_CONFLICT` | Stale `ifVersion` | Re-retrieve version; retry commit |
| `ECP_LOOP_UNTYPED` | forEach `expr` without typed items | Prefer `ref`; warning only (exit 0) |

## Run-time (failed run, exit 1 unless noted)

| Code | When | Agent action |
| ---- | ---- | ------------- |
| `ECP_SECRET_MISSING` | Secret not in keychain/env | **Stop.** User sets `ecp config secrets set` |
| `ECP_STEP_FAILED` | Handler threw | Read message; fix input/config |
| `ECP_STEP_TIMEOUT` | Handler exceeded timeout | Simplify work or split steps |
| `ECP_OUTPUT_INVALID` | Output vs `returns` | Fix capability or transform |
| `ECP_EXPR_FAILED` | Control `expr` threw | Fix logic or guard state |
| `ECP_EXPR_TIMEOUT` | `expr` over 50 ms | Simplify expression |
| `ECP_EXPR_RESULT_INVALID` | Non-boolean in control; bad loop source | Fix types |
| `ECP_SCRIPT_FAILED` | Transform script threw | Fix script |
| `ECP_SCRIPT_TIMEOUT` | Transform over 1000 ms | Optimize script |
| `ECP_PLUGIN_LOAD_FAILED` | Plugin import/handler broken | Reinstall/link; check logs |
| `ECP_PROVIDER_ERROR` | Upstream API error | Check config/secrets; escalate |
| `ECP_RUN_CANCELLED` | User/agent cancelled | Expected; do not retry blindly |
| `ECP_LIMIT_EXCEEDED` | Loop/item cap hit | Reduce inputs or raise limits in design |
| `ECP_INTERNAL` | Host bug | Note log reference; escalate |

## Host (exit 4 unless noted)

| Code | When | Agent action |
| ---- | ---- | ------------- |
| `ECP_HOST_RESTARTING` | Drain in progress | Wait `retryAfterMs`; retry once |
| `ECP_HOST_UNAVAILABLE` | Start/discovery failed | `ecp host logs`; fix install |
| `ECP_UNAUTHORIZED` | Token/header mismatch | Local host only; check env |

## Exit summary

| Exit | Meaning |
| ---- | ------- |
| 0 | Success, valid validation, or warning-only |
| 1 | Failed/cancelled run or internal |
| 2 | Invalid request/manifest/not found/patch |
| 3 | Missing first-party plugin |
| 4 | Host unavailable/unauthorized |