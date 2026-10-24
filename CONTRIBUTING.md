# Contribute to the documentation

Thanks for helping improve the ECP (Execution Control Protocol) docs. This guide explains how to make changes safely and keep writing consistent.

This repo uses **npm** (`npm ci`, `package-lock.json`). Do not use pnpm here.

During the CLI reset, open feature PRs into `feat/cli-reset-docs`. Do not merge `main` until the rewrite is ready to deploy.

## How to contribute

### Option 1: Edit directly on GitHub

1. Navigate to the page you want to edit
2. Click the "Edit this file" button (the pencil icon)
3. Make your changes and submit a pull request

### Option 2: Local development

1. Fork and clone this repository
2. Install the Mintlify CLI: `npm i -g mint`
3. Create a branch for your changes
4. Run the docs site locally:

   ```bash
   npm ci
   npm run dev
   ```

5. Preview at `http://localhost:3000`
6. Run `npm run lint` and `npm run secrets:scan` before opening a PR (matches CI and the Husky pre-commit hook)
7. Commit your changes and submit a pull request

This file is the guide for **previewing and validating this documentation site**. For building the **ECP engine and CLI** from source, see **[Build from source](/getting-started/build-from-source)** (or clone the [main repository](https://github.com/executioncontrolprotocol/executioncontrolprotocol)).

## Writing guidelines

- **Follow project voice and SEO rules**: see `AGENTS.md` and `.cursor/rules/docs-voice-seo.mdc`
- **Public-only content**: no internal ops (analytics, prompt-logging backends, private `.env` catalogs). The App is `ecp app` on loopback, not a hosted demo.
- **No emojis**: do not use emoji characters in docs
- **Match the right path**: intended install is **`npm install -g @executioncontrolprotocol/cli@next`**; until `@next` exists, send readers to **[Build from source](/getting-started/build-from-source)**
- **Authoring surface**: workflow files (`*.ecp.ts`) — not YAML Context
- **Do not** document harnesses, the browser demo, Chrome AI, EQL, `ecp test`, `ecp serve`, `ecp up`, or root `ecp encode` / `ecp decode`
- **Use active voice**: “Run the command” not “The command should be run”
- **Address the reader directly**: use “you”
- **Keep sentences concise**: one idea per sentence when possible
- **Lead with intent**: start sections with what the reader will accomplish
- **Use consistent terminology**: first mention as “ECP (Execution Control Protocol)”, then vary naturally

## Before you open a PR

From the repo root:

```bash
npm run lint
npm run secrets:scan
```

CLI and plugin reference pages are generated. From a sibling ECP checkout:

```bash
npm run generate:reference -- --ecp-root ../executioncontrolprotocol
```

Do not hand-edit `reference/cli.mdx`, `reference/plugins.mdx`, or `llms.txt`. CI regenerates them from `milestone/cli-reset` and fails if they are stale.
