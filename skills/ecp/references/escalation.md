# Escalation

Stop and ask the user when you cannot proceed safely.

| Situation | Action |
| --------- | ------ |
| `ECP_SECRET_MISSING` | User runs `ecp config secrets set <key>` or sets `ECP_SECRET_<KEY>`. Never ask them to paste the value into the execution. |
| Third-party `ecp plugins install` | Show package name; wait for explicit approval. |
| Destructive `commit --action delete` | Confirm id and version; prefer showing `retrieve` output first. |
| `commit --action update` on production ids | Confirm `ifVersion` and diff with the user when impact is unclear. |
| `onError: "continue"` in `forEach` | Explain partial failures in `state.<into>Errors`; confirm whether to proceed. |
| `ECP_PROVIDER_ERROR` / auth errors | Do not guess credentials; user fixes config/secrets. |
| `ECP_PLUGIN_LOAD_FAILED` on user-linked code | User fixes their package; you only adjust executions. |
| Resume after failure | `--resume <runId>` is **not** always idempotent; confirm with the user before resuming side-effecting runs. |
| Paid or cloud providers | Prefer local/bundled capabilities when possible; otherwise user supplies secrets via config. |
| MCP vs CLI | Same operations; prefer CLI unless the user asked for MCP. |
| App (`ecp app`) | Live graph viewer on loopback; suggest it so the user can watch your edits. Use the CLI or MCP for the loop itself. |

## Monorepo contributors

This skill targets **consumers** of ECP. People working in the executioncontrolprotocol repository should install the contributor skill:

```bash
npx skills add executioncontrolprotocol/executioncontrolprotocol --skill ecp-core -y
```

Do not document harnesses, YAML Context, `ecp test`, `ecp serve`, `ecp up`, Chrome AI, or EQL here.