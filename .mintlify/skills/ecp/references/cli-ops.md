# CLI reference (ECP skill)

## Install

```bash
npm install -g @executioncontrolprotocol/cli
```

## Commands

| Command | Notes |
| ------- | ----- |
| `ecp run <workflow> --env <env>` | `--input`, `--dry-run` |
| `ecp validate <workflow> --env <env>` | Capability checks |
| `ecp compile <workflow> -o out.json` | No `--env` |
| `ecp describe --env <env>` | Discovery |
| `ecp search <query> --env <env>` | Capability search |
| `ecp encode … --format json\|toon\|fluent --env …` | Format extensions |
| `ecp decode … --format toon --env …` | No Fluent decode — use `compile` |
| `ecp invoke <capability-id> --env <env>` | Outside a workflow; `--input`, `--uses` |
| `ecp serve --env <env>` | Loopback HTTP `POST /v1/invoke` (no auth) |
| `ecp up` | Ollama bridge + open demo |
| `ecp config secrets …` | OS keychain `add` / `list` / `get` / `remove` |
| `ecp test start … -o session.json` | Create idle test session |
| `ecp test run --to <step-id> --session …` | Inclusive run-through; freezes state |
| `ecp test rerun <step-id> --session …` | Rerun one step; clear downstream |
| `ecp test status --session …` | Session snapshot summary |

Encode/decode/patch document results use `.result` (not `.content` / `.document`).

## Test session loop

Distinct from monorepo `npm run test:unit` / harness evals. Freezes workflow state between ops:

```bash
ecp test start workflow.ts --env environment.ts -o session.json
ecp test run --to step-b --env environment.ts --session session.json
ecp test rerun step-a --env environment.ts --session session.json
ecp test status --session session.json
```

## `ecp up` / `ecp serve`

- Default daemon: `http://127.0.0.1:3090`
- `ecp up` — Ollama bridge + pairing token for browser demo
- `ecp serve --env …` — expose bound environment invoke over loopback (no auth)

## Secrets

See `secrets-and-config.md`.

Public reference: https://executioncontrolprotocol.io/reference/cli
