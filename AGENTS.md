# Documentation project instructions

Docs should contain public information only: installing, configuring, and running ECP.

## About this project

- Pages are MDX files with YAML frontmatter.
- Content is public-facing and focuses on installing, configuring, and running ECP (Execution Control Protocol).
- Stack: Mintlify. Navigation: `docs.json`.
- Agent skills: `.mintlify/skills/ecp/` (canonical consumer skill `ecp`; Phase 6 PR 3 moves it to `skills/ecp/` so `npx skills add executioncontrolprotocol/docs` finds it). For monorepo work, agents install `ecp-core` from the core GitHub repo.

## Terminology

- **ECP**: Prefer first mention as **“ECP (Execution Control Protocol)”**.
- **Workflow**: Portable Fluent/TS or JSON execution graph. Capitalize when referring to the ECP object.
- **Environment**: Host bindings (runtime, extensions, policies) that execute workflows.
- **Ecp**: Operational instance returned by `env.init()`.
- **Fluent API**: Public authoring spec for workflow files (not YAML Context).
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
  - Code formatting for file names, commands, and paths

## Content boundaries

- Public pages: install, configure, run, workflow files, CLI.
- Do not publish Mintlify/`docs.json`/contribution workflow on public MDX pages (keep that in README/CONTRIBUTING).
- **No internal product ops** on public pages or in the consumer skill: analytics backends, prompt/telemetry logging vendors, private `.env` / feature-flag wiring, unpublished roadmaps, or App implementation details that only maintainers need.
- **Do not** document harnesses, the browser demo, Chrome AI, EQL, `ecp test`, `ecp serve`, `ecp up`, or root `ecp encode` / `ecp decode`. Format plugins are `ecp format-toon encode`.
- MCP and App pages are placeholders until Phases 7 and 8.

## Cursor rules

- Docs voice + SEO guidance lives in `.cursor/rules/docs-voice-seo.mdc` and applies to `**/*.{md,mdx}` in this repo.
