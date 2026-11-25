# Documentation project instructions

Public documentation for ECP (Execution Control Protocol): installing, configuring, and running ECP, writing executions, and extending it with plugins.

## About this project

- Pages are MDX files with YAML frontmatter (`title`, `description`). No H1 in the body; Mintlify renders the title.
- Stack: Mintlify. Navigation and redirects: `docs.json`. Removing or renaming a page needs a redirect.
- Source of truth for behaviour: the latest ECP release (`main` in the ECP monorepo; `development` is ahead and unreleased), `realignment/spec/` first, then the published CLI (`ecp <command> --help`). When the docs and the spec disagree, check the running CLI and say which one is wrong.
- Generated files (never hand-edit): `reference/cli.mdx`, `llms.txt`, `examples/index.json`, `examples/*/README.md`, examples copied from the ECP repo, the examples table and `metadata.version` in `skills/*/SKILL.md`. Regenerate with `npm run generate:reference -- --ecp-root <ecp checkout>`, then `npm run check:examples -- --ecp-root <built ecp checkout>`.
- Agent skills: `skills/ecp/` (operate ECP) and `skills/ecp-setup/` (install from scratch). `.mintlify/skills` is a symlink to `skills/`, so Mintlify serves them at `/.well-known/agent-skills/` and `npx skills add https://executioncontrolprotocol.io` installs them. Mintlify serves only `SKILL.md` per skill: keep each skill self-contained (no `references/` folder) and link to page `.md` URLs for depth. Skill files are parsed as MDX: no HTML comments. Monorepo contributors use `ecp-core` from the core repo.
- Examples: `examples/catalog.json` is the source of truth. Entries with an `ecp` block are copied from the ECP repo; the rest live here. Agents download `examples/` from GitHub `main`; `index.json` carries the ECP version so a skills update triggers a re-download.

## Terminology

- **ECP**: first mention on a page is "ECP (Execution Control Protocol)".
- **Execution**: the JSON document (`*.ecp.json`, `schema: "@executioncontrolprotocol.execution"`, `version: "2.0"`). "Workflow" is fine as an informal synonym in prose, never as the name of the object.
- **Step, branch, loop, parallel**: the node kinds. **Capability**: one typed operation a plugin provides. **Plugin**: npm package that provides capabilities.
- **Host**: the local process (with its supervisor) that validates and runs executions. **Config**: stored plugin settings with `$secret` references. **Run** and **run record**: one run and what it stored.
- **Operations**: exactly three, `retrieve`, `execute`, `commit`, on every surface (CLI, MCP, HTTP).
- **MCP**: Model Context Protocol; don't expand unless the page is MCP-focused.

## Removed concepts (never document as current)

Fluent TypeScript (`*.ecp.ts`, `workflow()`, `step()`), requirements documents, environments and `--env`, policies, journals under `.ecp/runs`, `ecp search|describe|validate|run|runs|init|invoke`, `ecp mcp serve`, per-capability MCP tools, plugin-generated CLI commands, YAML Context, harnesses, the browser demo.

## Style

- **Voice**: technically friendly, precise, no hype. Lead with what the reader will accomplish.
- Active voice, second person, one idea per sentence, sentence-case headings, short paragraphs, concrete examples.
- End pages with "Next steps" (2 to 4 links).
- Bold for UI elements (**Run**); code formatting for files, commands, fields, and paths.
- No emojis.
- **Every JSON example must validate** against the current host (`ecp execute <file> --validate`). Prefer examples that only need the bundled core plugin (`core.transform`, `core.parse-csv`) so readers can run them on a fresh install.

## Content boundaries

- Public pages: install, configure, run, write executions, extend. Keep contribution workflow, Mintlify, and `docs.json` details in README/CONTRIBUTING.
- **Plugins**: don't catalogue plugins or document vendor-specific capabilities (Adobe, Azure, Anthropic, and so on). Link to the plugins folder on GitHub and teach discovery with `ecp retrieve`. Generic features (transforms, expressions, scripts, files, publishing) and the plugin SDK are in scope.
- No internal product ops: analytics, telemetry vendors, private `.env` or feature flags, unpublished roadmaps, or App internals only maintainers need.

## Cursor rules

Docs voice and SEO guidance lives in `.cursor/rules/docs-voice-seo.mdc` and applies to `**/*.{md,mdx}`.
