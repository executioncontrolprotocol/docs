# Secrets and env configuration (ECP)

Keep credentials on the host. Never put API keys in workflow manifests.

## Store (CLI / OS keychain)

```bash
ecp config secrets add openai/api-key
ecp config secrets add openai/api-key --value "sk-…"   # non-interactive; avoid shell history
ecp config secrets list
ecp config secrets get openai/api-key
ecp config secrets remove openai/api-key
```

Ref form: `ecp://<key>` (e.g. `ecp://openai/api-key`).

## Bind in the environment

```ts
import "@executioncontrolprotocol/secrets"
import { environment, extension, secrets } from "@executioncontrolprotocol/node"

export default (await environment("demo")).withExtensions([
  extension("@executioncontrolprotocol/secrets").with({}),
  extension("@executioncontrolprotocol/openai").with({
    apiKey: secrets("openai/api-key"),
  }),
])
```

- `secrets("key")` / `{ $secret: "key" }` resolve via the OS keychain at bind time
- Optional: `secrets("key", { optional: true, fallback: … })`
- `@executioncontrolprotocol/node` registers the secrets extension on `environment()`; still bind it when you pass `secrets(…)` config
- `env("VAR")` / process-env is environment setup only — prefer `secrets()` for production credentials

## Anti-patterns

- Do **not** hardcode keys in workflows or commit them to git
- Do **not** use `secrets()` or `env()` inside portable workflow graphs
- Do **not** invent ad-hoc `.env` loaders for ECP extension config when keychain + `secrets()` is available

## Browser demo

Cloud keys belong in the encrypted **browser-secrets** vault (passphrase). See https://executioncontrolprotocol.io/getting-started/browser-demo-providers

Public security guide: https://executioncontrolprotocol.io/learn/security
