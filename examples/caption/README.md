# One-shot caption with Claude

A single model call with a fixed prompt; the smallest model-backed execution.

Shows: `anthropic.generate`, `default config`.

Run the commands below from this folder (`ecp-examples/caption`).

## Set up

```bash
ecp plugins install anthropic
ecp commit --type config --action create --object @../configs/anthropic.default.json
ecp config secrets set anthropic.apiKey   # paste the value when prompted
```

## Run

```bash
ecp execute caption.ecp.json --input '{}'
```

Generated from `examples/catalog.json` for ECP 0.60.0. Do not edit by hand.
