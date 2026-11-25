#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { docsRoot, readJson } from "./lib/reference-utils.mjs"

const SITE = "https://executioncontrolprotocol.io"

/**
 * @param {string} source
 */
function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { title: "", description: "" }
  const block = match[1]
  const title = block.match(/^title:\s*"([^"]*)"/m)?.[1] ?? ""
  const description = block.match(/^description:\s*"([^"]*)"/m)?.[1] ?? ""
  return { title, description }
}

/**
 * @param {unknown} node
 * @param {string[]} acc
 */
function collectPages(node, acc) {
  if (typeof node === "string") {
    acc.push(node)
    return
  }
  if (Array.isArray(node)) {
    for (const item of node) collectPages(item, acc)
    return
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node)) collectPages(value, acc)
  }
}

export async function generateLlms() {
  const docs = /** @type {{ name?: string, navigation?: unknown }} */ (
    await readJson(join(docsRoot, "docs.json"))
  )
  /** @type {string[]} */
  const pages = []
  collectPages(docs.navigation, pages)
  const unique = [...new Set(pages)]

  const lines = [
    `# ${docs.name ?? "ECP (Execution Control Protocol)"}`,
    "",
    "> ECP (Execution Control Protocol) is the deterministic delegation layer for agents: capture repeatable work as a JSON execution (*.ecp.json) that a local host validates, runs, and records, through three operations (retrieve, execute, commit) on the CLI, MCP, and HTTP.",
    "",
    "## Agent instructions",
    "",
    "- To set up ECP on this machine, install the ECP skills and follow the ecp-setup skill: `npx skills add https://executioncontrolprotocol.io -g -y`. Without skills support, follow " + `${SITE}/getting-started/agents.md` + ".",
    "- Requirements: Node.js 22.12 or later (current LTS recommended), then `npm install -g @executioncontrolprotocol/cli`.",
    "- Skills: `ecp-setup` (install and configure) and `ecp` (write, validate, run executions). Update with `npx skills update`. Discovery: " + `${SITE}/.well-known/agent-skills/index.json` + ".",
    "- Runnable examples: https://github.com/executioncontrolprotocol/docs/tree/main/examples (index.json lists files, plugins, and run commands).",
    "- Every page below is Markdown: the links end in .md. Never put secrets in executions or chat; users store them with `ecp config secrets set <key>`.",
    "",
    "## Docs",
    "",
  ]

  for (const page of unique) {
    const mdxPath = join(docsRoot, `${page}.mdx`)
    if (!existsSync(mdxPath)) continue
    const meta = frontmatter(await readFile(mdxPath, "utf8"))
    const title = meta.title || page
    const description = meta.description || title
    lines.push(`- [${title}](${SITE}/${page}.md): ${description}`)
  }

  lines.push("")
  const out = join(docsRoot, "llms.txt")
  await writeFile(out, `${lines.join("\n")}\n`, "utf8")
  return out
}

if (process.argv[1]?.endsWith("gen-llms.mjs")) {
  const out = await generateLlms()
  console.log(`wrote ${out}`)
}
