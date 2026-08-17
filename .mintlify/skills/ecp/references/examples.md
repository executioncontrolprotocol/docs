# Examples (ECP)

Prefer **fetching or cloning runnable examples** over inventing APIs from memory.

## Core consumer examples

Repo: https://github.com/executioncontrolprotocol/executioncontrolprotocol/tree/main/examples

| Folder | Teaches |
| ------ | ------- |
| `01-echo` | Minimal Fluent + test extension + CLI |
| `02-weekly-brief` | Multi-step + `ref()` + provider bind |
| `03-secrets-bind` | `ecp config secrets` + `secrets()` in extension config |
| `04-encode-decode` | TOON / fluent encode round-trip |
| `05-test-session` | `ecp test start` / `run --to` / `rerun` / `status` |
| `06-invoke` | `ecp invoke` (and optional `serve`) outside a workflow |
| `07-accepts-returns` | `.accepts()` / `.returns()` + `ecp run --input` |

Index: https://github.com/executioncontrolprotocol/executioncontrolprotocol/blob/main/examples/README.md

## Vendor extension examples

Repo: https://github.com/executioncontrolprotocol/extensions/tree/main/examples

| Folder | Teaches |
| ------ | ------- |
| `02-weekly-brief-with-slack` | Slack send + memory/OpenAI |
| `03-fal-chain` | fal.generate chain |
| `04-image-prep` | image-sharp inspect/normalize/derive |
| `adobe-firefly-smoke` | Adobe Firefly |
| `azure-adobe-assets` | Azure blob + Firefly |

Index: https://github.com/executioncontrolprotocol/extensions/blob/main/examples/README.md

## How to pull

1. Clone the repo, or sparse-checkout `examples/`
2. Or fetch raw files from GitHub when you only need one pair
3. After installing `ecp-core` / `ecp-extensions`, use that skill’s example index

Do **not** duplicate vendor examples into docs or invent fal/Slack/Adobe APIs without reading the matching example.
