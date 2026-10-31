# Error codes

`--json` failure envelope: `{ ok: false, error: { code, message, path, suggestions } }`. Execution failures also include `data` (the run or invoke record).

| Code | Cause | What you do |
| ---- | ----- | ----------- |
| `ECP_WORKFLOW_LOAD` | File would not compile | Fix TypeScript / path |
| `ECP_PLUGINS_MISSING` | Required or `--format` plugin absent | `ecp plugins install <name>` (ask if third-party) |
| `ECP_CAPABILITY_UNKNOWN` | Step id not in the registry | `ecp search` / install the plugin |
| `ECP_INPUT_INVALID` | Schema failed (wrong `ref()`, bad payload) | Fix the step input; `validate --json` |
| `ECP_REF_UNRESOLVED` | `ref()` target missing | Fix `.as()` names |
| `ECP_BINDING_INVALID` | Bad extension/policy binding | Fix `.with()` config (placeholders only) |
| `ECP_ENVIRONMENT_UNSUPPORTED` | `.supports()` excludes this host | Use a supported host or drop the plugin |
| `ECP_SECRET_MISSING` | `secrets("key")` unresolved | **Stop.** Ask the user to add the secret |
| `ECP_POLICY_DENIED` | Policy rejected the step | **Stop** or change policy with the user |
| `ECP_RUN_PAUSED` | Waiting (approval) | `ecp runs resume` after the user approves |
| `ECP_STEP_FAILED` | Capability threw | Read message; fix expression/input |
| `ECP_OUTPUT_INVALID` | Output failed schema | Fix the capability usage |
| `ECP_PLUGIN_DENIED` | User declined install | **Stop.** Do not install |
| `ECP_RERUN_INCOMPATIBLE` | Graph changed before `--from` | New `ecp run`, not rerun |

Exits: `0` ok, `1` failed run, `2` usage, `3` validation, `4` plugin/environment load.
