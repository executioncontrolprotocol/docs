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
| `ecp decode … --format toon --env …` | No Fluent decode |
| `ecp up` | Ollama bridge + open demo |
| `ecp config secrets …` | OS keychain |

## `ecp up`

- Default daemon: `http://127.0.0.1:3090`
- Opens `https://executioncontrolprotocol.github.io/browser-demo/?token=…&bridge=…`
- `--open-url`, `--no-open`, `--cors-origin`
- Hosted HTTPS needs Chromium for Private Network Access
