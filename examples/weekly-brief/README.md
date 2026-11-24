# Weekly brief with Claude

One model call that turns a list of signals into a short leadership brief.

Shows: `anthropic.generate`, `config objects`, `secrets`.

Run the commands below from this folder (`ecp-examples/weekly-brief`).

## Set up

```bash
ecp plugins install anthropic
ecp commit --type config --action create --object @../configs/anthropic.default.json
ecp config secrets set anthropic.apiKey   # paste the value when prompted
```

## Run

```bash
ecp execute weekly-brief.ecp.json --input '{"signals": ["Shipped the new onboarding", "Churn down 2%"]}'
```

Generated from `examples/catalog.json` for ECP 0.60.0. Do not edit by hand.
