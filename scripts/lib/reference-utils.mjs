import { readFile, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/** Docs repo root (parent of `scripts/`). */
export const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

/**
 * Parse `--ecp-root` from argv or `ECP_ROOT`, falling back to a sibling checkout.
 * @param {string[]} argv
 * @returns {string}
 */
export function resolveEcpRoot(argv = process.argv.slice(2)) {
  let fromArg
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--ecp-root") {
      fromArg = argv[i + 1]
      break
    }
  }
  const candidate = fromArg ?? process.env.ECP_ROOT ?? join(docsRoot, "..", "executioncontrolprotocol")
  const root = resolve(candidate)
  if (!existsSync(join(root, "packages", "cli"))) {
    throw new Error(
      `ECP checkout not found at ${root}. Pass --ecp-root <path> (packages/cli + plugins/plugin-*).`
    )
  }
  return root
}

/**
 * @param {string} path
 * @returns {Promise<unknown>}
 */
export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"))
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
export async function listPluginDirs(ecpRoot) {
  const pluginsRoot = join(ecpRoot, "plugins")
  if (!existsSync(pluginsRoot)) return []
  const entries = await readdir(pluginsRoot, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("plugin-"))
    .map((entry) => join(pluginsRoot, entry.name))
    .sort()
}

/**
 * Convert an oclif command id (`plugins:new`) to an argv string (`ecp plugins new`).
 * @param {string} id
 */
export function commandLine(id) {
  return `ecp ${id.replaceAll(":", " ")}`
}

/**
 * First paragraph of an oclif description (strip generated use-case/projection dumps).
 * @param {string | undefined} description
 */
export function firstParagraph(description) {
  if (!description) return ""
  const cut = description.split(/\nUse cases:|\nProjections:/)[0]
  return cut.replace(/\s+/g, " ").trim()
}

/**
 * Escape `{` / `<` so generated prose is safe in MDX outside fences.
 * @param {string} text
 */
export function mdxEscape(text) {
  return text.replaceAll("{", "\\{").replaceAll("<", "\\<")
}
