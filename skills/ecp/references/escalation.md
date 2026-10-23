# Escalation

Stop and ask the user when you cannot proceed safely. Do not guess secrets, approve policies, or install untrusted plugins.

| Situation | Action |
| --------- | ------ |
| `ECP_SECRET_MISSING` | Ask the user to run `ecp config secrets add <key>` (or set the OS keychain / CI secret). Never inline the value. |
| `ECP_RUN_PAUSED` / approval | Tell the user the run is waiting. Resume only after they approve. |
| Third-party `ecp plugins install` | Show the package name and wait for explicit approval. |
| `ECP_PLUGIN_DENIED` | Stop. Do not retry with `--yes` or `--allow-source`. |
| `ECP_POLICY_DENIED` | Explain the denial. Change budget/approval config only if they ask. |
| Paid model keys (Anthropic, OpenAI, FAL, Firefly, Azure) | Prefer Ollama / jsonata / image-sharp local paths, or ask them to bind secrets. |
| MCP (`ecp mcp serve`) or the visual App | Those pages are placeholders (Phase 7 / 8). Stay on the CLI. |

## Monorepo work

This skill is for **consumers**. Contributors to the ECP monorepo should install:

```bash
npx skills add executioncontrolprotocol/executioncontrolprotocol --skill ecp-core -y
```

Do not invent harnesses, YAML Context, `ecp test`, `ecp serve`, `ecp up`, Chrome AI, or EQL.
