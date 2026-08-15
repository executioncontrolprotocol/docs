# Execution Control Protocol docs

This repository contains the documentation site for **ECP (Execution Control Protocol)**, built with [Mintlify](https://mintlify.com).

## What’s in here

- **Site config**: `docs.json`
- **Pages**: `**/*.mdx` (Fluent workflows, environments, CLI, browser demo)
- **Agent skills**: `.mintlify/skills/ecp/` (consumer skill `ecp`)
- **Project writing rules**: `AGENTS.md` and `.cursor/rules/docs-voice-seo.mdc`

## Develop locally

1. Install the Mintlify CLI:

```bash
npm i -g mint
```

2. From this repo root (where `docs.json` lives), run:

```bash
mint dev
```

Then open `http://localhost:3000`.

## Check for broken links

From the repo root:

```bash
npm install
npm run lint
```

(`npm run validate` is an alias for the same Mintlify checks.)

## AI-assisted writing (optional)

Install Mintlify’s docs skill:

```bash
npm install -g skills
npx skills add https://mintlify.com/docs
```

Install the ECP product skill from the live site (canonical pack: `.mintlify/skills/ecp/`):

```bash
npx skills add https://executioncontrolprotocol.io
```

Monorepo skills (after those repos publish `skills/`):

```bash
npx skills add executioncontrolprotocol/executioncontrolprotocol --skill ecp-core -y
npx skills add executioncontrolprotocol/extensions --skill ecp-extensions -y
```

## Contributing

See `CONTRIBUTING.md`.
