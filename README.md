# Execution Control Protocol docs

This repository contains the documentation site for **ECP (Execution Control Protocol)**, built with [Mintlify](https://mintlify.com).

## What’s in here

- **Site config**: `docs.json`
- **Pages**: `**/*.mdx` (Fluent workflows, environments, CLI, browser demo)
- **Agent skills**: `skill.md` and `.mintlify/skills/ecp/SKILL.md`
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
npm run validate
```

## AI-assisted writing (optional)

Install Mintlify’s docs skill:

```bash
npm install -g skills
npx skills add https://mintlify.com/docs
```

Install the ECP product skill from the live site:

```bash
npx skills add https://executioncontrolprotocol.io
```

## Contributing

See `CONTRIBUTING.md`.
