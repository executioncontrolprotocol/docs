> Docs should contain public information only: installing, configuring, and running ECP.

# Documentation project instructions

## About this project

- Pages are MDX files with YAML frontmatter.
- Content is public-facing and focuses on installing, configuring, and running ECP (Execution Control Protocol).
- Stack: Mintlify. Navigation: `docs.json`.
- Agent skills: `.mintlify/skills/ecp/` (canonical consumer skill `ecp`). For monorepo work, agents install `ecp-core` / `ecp-extensions` from the core and extensions GitHub repos.

## Terminology

- **ECP**: Prefer first mention as **“ECP (Execution Control Protocol)”**.
- **Workflow**: Portable Fluent/TS or JSON execution graph. Capitalize when referring to the ECP object.
- **Environment**: Host bindings (runtime, extensions, policies) that execute workflows.
- **Ecp**: Operational instance returned by `env.init()`.
- **Fluent API**: Public authoring spec for workflows (not YAML Context).
- **MCP**: Model Context Protocol; don’t expand unless the page is MCP-focused.
- **Do not** document legacy YAML Context / `ECPContext` / `spec.yaml` as current.

## Style preferences

- **Voice**: technically friendly but light; precise without hype; forward-moving (goal → concept → next step).
- **SEO**: helpful, non-spammy; use ECP + Execution Control Protocol variants naturally.
- **Writing**:
  - Use active voice and second person (“you”)
  - Keep sentences concise — one idea per sentence
  - Use sentence case for headings
  - Prefer short paragraphs and concrete examples
  - Use “Related reading” / “Next steps” sections when useful
- **Formatting**:
  - Bold for UI elements: Click **Settings**
  - Code formatting for file names, commands, paths, and code references

## Content boundaries

- Public pages: install, configure, run, Fluent authoring, CLI, browser demo (public URL + how to use it).
- Do not publish Mintlify/`docs.json`/contribution workflow on public MDX pages (keep that in README/CONTRIBUTING).
- Do not deep-dive monorepo-only eval matrices on public pages.
- **No internal product ops on public pages or in the consumer skill:** analytics backends, prompt/telemetry logging vendors (e.g. Supabase), private `.env` / feature-flag wiring, unpublished roadmaps, or demo app implementation details that only maintainers need.
- **Browser demo docs:** lead with the [hosted demo URL](https://executioncontrolprotocol.github.io/browser-demo/). For clone, `npm run dev`, linking packages, or contributor setup, **point at the [browser-demo GitHub repo](https://github.com/executioncontrolprotocol/browser-demo)** (and its README) instead of duplicating internal app setup here.

## Cursor rules

- Docs voice + SEO guidance lives in `.cursor/rules/docs-voice-seo.mdc` and applies to `**/*.{md,mdx}` in this repo.
