# Contribute to the documentation

Thanks for helping improve the ECP (Execution Control Protocol) docs. This guide explains how to make changes safely and keep writing consistent.

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
   mint dev
   ```

5. Preview at `http://localhost:3000`
6. Run `npm install` once, then `npm run validate` before opening a PR (matches CI and the Husky pre-commit hook)
7. Commit your changes and submit a pull request

This file is the guide for **previewing and validating this documentation site**. For building the **ECP engine and CLI** from source, see **[Build from source](https://executioncontrolprotocol.io/getting-started/build-from-source)** on the docs site (or clone the [main repository](https://github.com/executioncontrolprotocol/executioncontrolprotocol)).

## Writing guidelines

- **Follow project voice and SEO rules**: see `AGENTS.md` and `.cursor/rules/docs-voice-seo.mdc`
- **No emojis**: do not use emoji characters in docs
- **Match the right path**: quickstarts should use **`npm install -g @executioncontrolprotocol/cli`**; reserve clone-and-build steps for **[Build from source](https://executioncontrolprotocol.io/getting-started/build-from-source)**
- **Use active voice**: “Run the command” not “The command should be run”
- **Address the reader directly**: use “you”
- **Keep sentences concise**: one idea per sentence when possible
- **Lead with intent**: start sections with what the reader will accomplish
- **Use consistent terminology**: first mention as “ECP (Execution Control Protocol)”, then vary naturally

## Before you open a PR

From the repo root:

```bash
mint broken-links
```
