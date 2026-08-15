# Escalation (ECP)

Consumer fluency lives in this skill + public docs. For monorepo / protocol / vendor packaging work, install the repo skills.

## When to escalate

| Task | Action |
| ---- | ------ |
| Fluent, env, secrets, CLI, custom `withHandler` in an app | Stay on docs `ecp` skill |
| Still unsure after references | Fetch https://executioncontrolprotocol.io/llms.txt then the matching guide |
| Core monorepo, package boundaries, harnesses, first-party platform extensions | Install `ecp-core` |
| Vendor extensions monorepo (fal, Slack, …) | Install `ecp-extensions` |

## Install repo skills

```bash
npx skills add executioncontrolprotocol/executioncontrolprotocol --skill ecp-core -y
npx skills add executioncontrolprotocol/extensions --skill ecp-extensions -y
```

## Fallback (if skill install unavailable)

- Core: https://raw.githubusercontent.com/executioncontrolprotocol/executioncontrolprotocol/main/AGENTS.md
- Core extension rules: https://raw.githubusercontent.com/executioncontrolprotocol/executioncontrolprotocol/main/.cursor/rules/extensions.mdc
- Vendor: https://raw.githubusercontent.com/executioncontrolprotocol/extensions/main/AGENTS.md

## Do not invent

- Harness eval matrices / judge fail-open behavior (see `ecp-core`)
- YAML Context / `spec.yaml` / `ECPContext`
- Host imports inside extension packages
