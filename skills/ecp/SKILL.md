---
name: ecp
description: >-
  Delegates repeatable work to ECP (Execution Control Protocol): author
  *.ecp.ts workflow files, validate and run them with --json, install plugins,
  and repair from run journals. Use when the user needs a governed, deterministic
  graph instead of a one-off tool call. Do not use for YAML Context, ecp test,
  ecp serve, ecp up, the browser demo, or root ecp encode.
---

# ECP (Execution Control Protocol)

You operate ECP as a **deterministic delegation** capability. Author a workflow file, run it, read structured errors, repair, and rerun. You are not the whole harness.

Install: `npx skills add executioncontrolprotocol/docs` (this skill). CLI: `npm install -g @executioncontrolprotocol/cli` for **0.50.0** (`latest` field-test, not 1.0). Until that version is on the registry, build from source.

Learn flags from `ecp <command> --help`. Do not copy CLI tables into this skill.

## When to delegate

Use ECP when the work is **repeatable, governed, or must be repaired** (policies, journals, plugins). Do **not** use it for a single throwaway tool call or for chat-only reasoning. MCP is `ecp mcp serve` on the same host as the CLI (see the MCP guide). The visual App is `ecp app <file>` on that same host (see the App guide). Do not copy either catalogue here.

## Loop

1. `ecp search "<intent>"` / `ecp describe` / `ecp describe --capability <id>`
2. Write a `*.ecp.ts` file (`ecp init <name>` for a stub). Bind plugins with `.with([...])` or let inference fill requirements.
3. `ecp validate <file> --json`
4. `ecp run <file> --json` (optional `--to`, `--events`). `--env` is optional.
5. `ecp runs show <runId>` on failure. Patch the file. `ecp runs rerun <runId> --from <step>`

`--json` is `{ ok: true, data }` or `{ ok: false, error: { code, message, path, suggestions } }`.

## Hard rules

- Never put secret **values** in workflow or environment files. Use `secrets("key")`.
- Install plugins with `ecp plugins install <name>`. Third-party plugins need **user approval** (`ECP_PLUGIN_DENIED` if they refuse).
- There is no `ecp test`, `ecp serve`, `ecp up`, or root `ecp encode` / `decode`. Format plugins are `ecp format-toon encode`. The graph UI is `ecp app <file>` (see the App guide).
- Do not import hosts from plugin packages.

## Error codes (what to do)

| Code | Agent action |
| ---- | ------------ |
| `ECP_PLUGINS_MISSING` | `ecp plugins install <name>` (ask before third-party) |
| `ECP_INPUT_INVALID` / `ECP_REF_UNRESOLVED` | Fix `ref()` / payload; re-validate |
| `ECP_STEP_FAILED` | Read the message; fix the expression or capability input |
| `ECP_SECRET_MISSING` | Stop. Ask the user to set the secret (`ecp config secrets add`) |
| `ECP_POLICY_DENIED` | Stop or adjust policy config with the user |
| `ECP_RUN_PAUSED` | `ecp runs resume` after the user approves |
| `ECP_PLUGIN_DENIED` | Stop. Do not install untrusted plugins |
| `ECP_RERUN_INCOMPATIBLE` | Run a new `ecp run` instead of `--from` |

Full list: `references/errors.md`.

## References

- `references/workflow-files.md`
- `references/environments.md`
- `references/plugins.md`
- `references/errors.md`
- `references/examples.md` — three dogfood workflows
- `references/escalation.md` — when to stop and ask the user
