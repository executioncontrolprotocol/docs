# Execution Control Protocol docs

This repository contains the documentation site for **ECP (Execution Control Protocol)**, built with [Mintlify](https://mintlify.com).

**Live site:** https://executioncontrolprotocol.io/

Mintlify publishes `main`. The content documents the realigned ECP (JSON executions, the local host, `retrieve` / `execute` / `commit`) as of ECP `development`.

## What’s in here

- **Site config**: `docs.json`
- **Pages**: `**/*.mdx` (getting started, concepts, execution guides, host / MCP / App, plugin SDK, reference)
- **Generated**: `reference/cli.mdx` and `llms.txt` (`npm run generate:reference -- --ecp-root ../executioncontrolprotocol`)
- **Agent skills**: `skills/ecp/` and `skills/ecp-setup/`, served by Mintlify through the `.mintlify/skills` symlink (`npx skills add https://executioncontrolprotocol.io`)
- **Examples**: `examples/` (catalogue in `examples/catalog.json`), downloaded by agents from GitHub
- **Project writing rules**: `AGENTS.md` and `.cursor/rules/docs-voice-seo.mdc`

This repo uses **npm** (`package-lock.json`, `npm ci` in CI). Do not switch to pnpm here.

## Develop locally

1. Install the Mintlify CLI:

```bash
npm i -g mint
```

2. From this repo root (where `docs.json` lives), run:

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000`.

## Check for broken links

From the repo root:

```bash
npm ci
npm run lint
npm run secrets:scan
```

(`npm run validate` is an alias for the Mintlify checks.)

## AI-assisted writing (optional)

Install Mintlify’s docs skill:

```bash
npm install -g skills
npx skills add https://mintlify.com/docs
```

Install the ECP skills from the published site:

```bash
npx skills add https://executioncontrolprotocol.io
```

Monorepo contributor skill:

```bash
npx skills add executioncontrolprotocol/executioncontrolprotocol --skill ecp-core -y
```

## Contributing

See `CONTRIBUTING.md`.
