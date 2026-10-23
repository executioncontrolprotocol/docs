# Execution Control Protocol docs

This repository contains the documentation site for **ECP (Execution Control Protocol)**, built with [Mintlify](https://mintlify.com).

**Live site:** https://executioncontrolprotocol.io/

The CLI reset rewrite lives on `feat/cli-reset-docs`. Do not merge to `main` until the reset is ready to deploy (Mintlify publishes `main`).

## What’s in here

- **Site config**: `docs.json`
- **Pages**: `**/*.mdx` (workflow files, environments, CLI, plugins)
- **Agent skills**: `skills/ecp/` (consumer skill `ecp`; `npx skills add executioncontrolprotocol/docs`). `.mintlify/skills/ecp/` is a pointer only.
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

Install the ECP consumer skill from this repo:

```bash
npx skills add executioncontrolprotocol/docs
```

Monorepo contributor skill:

```bash
npx skills add executioncontrolprotocol/executioncontrolprotocol --skill ecp-core -y
```

## Contributing

See `CONTRIBUTING.md`.
