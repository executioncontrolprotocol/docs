# Config objects and secrets

Executions must not carry secrets. Credentials and provider settings live in **config objects** referenced by step `config`.

## Config object

```json
{
  "schema": "@executioncontrolprotocol.config",
  "version": "1.0",
  "id": "my-plugin/default",
  "plugin": "@acme/my-plugin",
  "values": {
    "apiKey": { "$secret": "my-plugin.apiKey" },
    "region": "us-east-1"
  }
}
```

- `id`: `<plugin-short>/<name>` (`plugin-short` is the package name without scope).
- `values` must match the plugin config schema; `{ "$secret": "key" }` and `{ "$env": "VAR" }` stand in for strings at resolve time.
- `retrieve --type config --id my-plugin/default` returns references only, never resolved secret values.

Commit:

```bash
ecp commit --type config --action create --object @config.json --json
ecp commit --type config --action update --id my-plugin/default --if-version 2 --patch @patch.json --json
```

## Secret values

Written only on the CLI (not MCP/HTTP):

```bash
ecp config secrets set my-plugin.apiKey
ecp config secrets list --json
ecp config secrets unset my-plugin.apiKey
```

Keys: `^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$`.

Environment fallback: `ECP_SECRET_<KEY>` with non-alphanumerics mapped to `_` (keychain wins over env).

## Agent rules

- Never put secret **values** in executions, patches, or chat.
- On `ECP_SECRET_MISSING`, stop and ask the user to run `ecp config secrets set <key>` (or set `ECP_SECRET_…` in CI).
- Default config id for a step is `<plugin-short>/default` when the step omits `config` and that object exists.