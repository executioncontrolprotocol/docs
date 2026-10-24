# Plugins

Package name is `plugin-` plus the extension or policy name. Protocol ids are unchanged.

```bash
ecp plugins install jsonata
ecp plugins link plugins/plugin-jsonata
ecp plugins new my-transform
ecp plugins build
```

First-party installs skip the trust prompt. **Third-party plugins need explicit user approval.** If they refuse, you get `ECP_PLUGIN_DENIED` — stop. Do not pass `--yes` / `--allow-source` unless the user asked.

`--format` on CLI output also needs a format plugin. Missing format plugin → `ECP_PLUGINS_MISSING`. There is no root `ecp encode`; use `ecp format-toon encode`.

Define plugins with `defineExtension` / `definePolicy`, `.withMetadata({ summary, description, useCases, projections })`, and `capabilityFor`. Import zod from `"zod"`. Never import `node`, `browser`, `cli`, or `mcp`.

See `ecp <topic> --help` for generated capability commands (`ecp jsonata transform`).
