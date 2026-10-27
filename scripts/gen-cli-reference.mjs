#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import {
  commandLine,
  docsRoot,
  firstParagraph,
  listPluginDirs,
  mdxEscape,
  readJson,
  resolveEcpRoot,
} from "./lib/reference-utils.mjs"

/**
 * @typedef {{
 *   id: string
 *   summary: string
 *   description: string
 *   examples: string[]
 *   aliases?: string[]
 *   flags: Record<string, { name?: string, description?: string, required?: boolean, type?: string, hidden?: boolean }>
 *   args: Record<string, { name?: string, description?: string, required?: boolean, hidden?: boolean }>
 *   hidden?: boolean
 *   pluginName?: string
 * }} ManifestCommand
 */

/**
 * @param {string} ecpRoot
 * @returns {Promise<ManifestCommand[]>}
 */
async function loadCommands(ecpRoot) {
  /** @type {ManifestCommand[]} */
  const commands = []

  const cliManifest = join(ecpRoot, "packages", "cli", "oclif.manifest.json")
  if (existsSync(cliManifest)) {
    commands.push(...commandsFromManifest(await readJson(cliManifest), "@executioncontrolprotocol/cli"))
  } else {
    commands.push(...(await parseCliOperations(join(ecpRoot, "packages", "cli", "src", "operations"))))
  }

  for (const dir of await listPluginDirs(ecpRoot)) {
    const manifestPath = join(dir, "oclif.manifest.json")
    if (!existsSync(manifestPath)) continue
    const pkg = existsSync(join(dir, "package.json"))
      ? /** @type {{ name?: string }} */ (await readJson(join(dir, "package.json")))
      : {}
    commands.push(...commandsFromManifest(await readJson(manifestPath), pkg.name ?? dir))
  }

  const seen = new Set()
  return commands.filter((command) => {
    if (command.hidden || seen.has(command.id)) return false
    seen.add(command.id)
    return true
  })
}

/**
 * @param {{ commands?: Record<string, ManifestCommand> }} manifest
 * @param {string} pluginName
 * @returns {ManifestCommand[]}
 */
function commandsFromManifest(manifest, pluginName) {
  const entries = Object.values(manifest.commands ?? {})
  const aliasIds = new Set()
  for (const command of entries) {
    for (const alias of command.aliases ?? []) {
      if (alias !== command.id) aliasIds.add(alias)
    }
  }
  return entries
    .filter((command) => !aliasIds.has(command.id))
    .map((command) => ({
      id: command.id,
      summary: command.summary ?? command.id,
      description: firstParagraph(command.description),
      examples: Array.isArray(command.examples) ? command.examples.map(sanitizeExample) : [],
      aliases: (command.aliases ?? []).filter((alias) => alias !== command.id),
      flags: command.flags ?? {},
      args: command.args ?? {},
      hidden: Boolean(command.hidden),
      pluginName,
    }))
}

/**
 * Strip token-shaped placeholders so Secretlint does not treat generated docs as secrets.
 * @param {string} example
 */
function sanitizeExample(example) {
  return example
    .replace(/ghp_[A-Za-z0-9_]+/g, "<token>")
    .replace(/sk-[A-Za-z0-9]+/g, "<token>")
}

/**
 * Parse `defineOperation` source when the CLI has no committed oclif manifest.
 * @param {string} operationsDir
 * @returns {Promise<ManifestCommand[]>}
 */
async function parseCliOperations(operationsDir) {
  if (!existsSync(operationsDir)) return []
  const files = (await readdir(operationsDir)).filter((name) => name.endsWith(".ts"))
  /** @type {ManifestCommand[]} */
  const commands = []
  for (const file of files) {
    const source = await readFile(join(operationsDir, file), "utf8")
    const blocks = source.split(/export const \w+ = defineOperation\(/).slice(1)
    for (const block of blocks) {
      const idMatch = block.match(/^"([^"]+)"/)
      if (!idMatch) continue
      const id = idMatch[1]
      const summary = matchQuoted(block, "summary") ?? id
      const description = matchQuoted(block, "description") ?? ""
      const examples = matchStringArray(block, "examples")
      const aliases = matchStringArray(block, "aliases")
      const argNames = matchStringArray(block, "args")
      const flags = flagsFromZodObject(block)
      /** @type {Record<string, { name: string, required: boolean, description: string, type: string }>} */
      const args = {}
      for (const name of argNames) {
        const flag = flags[name]
        args[name] = {
          name,
          required: flag?.required ?? true,
          description: flag?.description ?? name,
          type: "option",
        }
        delete flags[name]
      }
      commands.push({
        id,
        summary,
        description,
            examples: examples.map(sanitizeExample),
            aliases: aliases.length > 0 ? aliases : undefined,
            flags,
            args,
            pluginName: "@executioncontrolprotocol/cli",
      })
    }
  }
  return commands
}

/**
 * @param {string} source
 * @param {string} key
 */
function matchQuoted(source, key) {
  const re = new RegExp(`${key}:\\s*(?:"([^"]*)"|'([^']*)')`)
  const match = source.match(re)
  if (match) return match[1] ?? match[2]
  const multi = source.match(new RegExp(`${key}:\\s*((?:\\s*"([^"]*)"\\s*\\+\\s*)+"([^"]*)")`))
  if (!multi) return undefined
  return [...multi[0].matchAll(/"([^"]*)"/g)].map((part) => part[1]).join("")
}

/**
 * @param {string} source
 * @param {string} key
 * @returns {string[]}
 */
function matchStringArray(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\[([^\\]]*)]`))
  if (!match) return []
  return [...match[1].matchAll(/"([^"]*)"/g)].map((part) => part[1])
}

/**
 * @param {string} source
 * @returns {Record<string, { name: string, description: string, required: boolean, type: string }>}
 */
function flagsFromZodObject(source) {
  const objectMatch = source.match(/z\.object\(\{([\s\S]*?)\}\)/)
  if (!objectMatch) return {}
  /** @type {Record<string, { name: string, description: string, required: boolean, type: string }>} */
  const flags = {}
  const fieldRe = /(?:"([^"]+)"|([A-Za-z0-9_]+)):\s*z\.(\w+)\([^)]*\)((?:\.\w+\([^)]*\))*)/g
  let field
  while ((field = fieldRe.exec(objectMatch[1]))) {
    const name = field[1] ?? field[2]
    const optional = field[4]?.includes("optional") ?? false
    flags[name] = {
      name,
      description: name,
      required: !optional,
      type: field[3] === "boolean" ? "boolean" : "option",
    }
  }
  return flags
}

/**
 * @param {ManifestCommand} command
 */
function renderCommand(command) {
  const heading = commandLine(command.id)
  const lines = [`## \`${heading}\``, "", mdxEscape(command.summary)]
  if (command.description && command.description !== command.summary) {
    lines.push("", mdxEscape(command.description))
  }
  if (command.pluginName && command.pluginName !== "@executioncontrolprotocol/cli") {
    lines.push("", `Plugin: \`${command.pluginName}\`.`)
  }
  if (command.aliases && command.aliases.length > 0) {
    lines.push(
      "",
      `Aliases: ${command.aliases.map((alias) => `\`${commandLine(alias)}\``).join(", ")}.`
    )
  }

  const argEntries = Object.values(command.args ?? {}).filter((arg) => !arg.hidden)
  if (argEntries.length > 0) {
    lines.push("", "### Args", "", "| Arg | Required | Description |", "| --- | --- | --- |")
    for (const arg of argEntries) {
      const name = arg.name ?? "arg"
      lines.push(
        `| \`${name}\` | ${arg.required ? "yes" : "no"} | ${mdxEscape(arg.description ?? "")} |`
      )
    }
  }

  const flagEntries = Object.values(command.flags ?? {}).filter((flag) => !flag.hidden)
  if (flagEntries.length > 0) {
    lines.push("", "### Flags", "", "| Flag | Type | Required | Description |", "| --- | --- | --- | --- |")
    for (const flag of flagEntries) {
      const name = flag.name ?? "flag"
      lines.push(
        `| \`--${name}\` | ${flag.type ?? "option"} | ${flag.required ? "yes" : "no"} | ${mdxEscape(flag.description ?? "")} |`
      )
    }
  }

  if (command.examples.length > 0) {
    lines.push("", "### Examples", "", "```bash")
    for (const example of command.examples) {
      lines.push(example)
    }
    lines.push("```")
  }

  lines.push("")
  return lines.join("\n")
}

/**
 * @param {string} ecpRoot
 */
export async function generateCliReference(ecpRoot) {
  const commands = await loadCommands(ecpRoot)
  commands.sort((a, b) => a.id.localeCompare(b.id))

  const hostCommands = commands.filter((c) => c.pluginName === "@executioncontrolprotocol/cli")
  const pluginCommands = commands.filter((c) => c.pluginName !== "@executioncontrolprotocol/cli")

  const body = [
    "---",
    'title: "CLI"',
    'description: "Generated CLI reference for ECP (Execution Control Protocol)."',
    "---",
    "",
    "{/* Generated by scripts/gen-cli-reference.mjs. Do not edit by hand. */}",
    "",
    "# CLI",
    "",
    "Generated from oclif manifests in the ECP checkout (`packages/cli` operations and `plugins/plugin-*/oclif.manifest.json`). Do not hand-edit. Learn flags from `ecp <command> --help` when in doubt.",
    "",
    "Install with `npm install -g @executioncontrolprotocol/cli` (**0.50.0** on `latest`). Contributors who are changing packages can [build from source](/getting-started/build-from-source).",
    "",
    "## `--json` envelope",
    "",
    "Every command accepts `--json`. Success prints `{ ok: true, data }`. Failure prints `{ ok: false, error: { code, message, path, suggestions } }` and a non-zero exit (`0` success, `1` failed run, `2` usage, `3` validation, `4` plugin/environment load).",
    "",
    "There is no `ecp test`, `ecp serve`, `ecp up`, or root `ecp encode` / `ecp decode`. Format plugins expose `ecp format-toon encode` (and similar). There is no shell-completion command; discover the surface with `ecp --help` and topic help (`ecp workflows`, `ecp environments`, `ecp config`, `ecp plugins`).",
    "",
    "## Plugin install (oclif)",
    "",
    "`ecp plugins install`, `ecp plugins link`, `ecp plugins uninstall`, and `ecp plugins update` come from `@oclif/plugin-plugins`. First-party packages install without a prompt. Third-party plugins require approval (`ECP_PLUGIN_DENIED` if you refuse). Source installs need `--allow-source`. `ecp plugins install <name> --add-to-env` appends a commented binding stub to the default environment file.",
    "",
    "```bash",
    "ecp plugins install jsonata",
    "ecp plugins link plugins/plugin-jsonata",
    "```",
    "",
    "## Host commands",
    "",
    ...hostCommands.map(renderCommand),
    "## Plugin commands",
    "",
    pluginCommands.length === 0
      ? "No plugin commands found in the ECP checkout.\n"
      : pluginCommands.map(renderCommand).join("\n"),
    "## Next steps",
    "",
    "- [Error codes](/reference/error-codes)",
    "- [Plugins](/reference/plugins)",
    "- [The agent loop](/guides/agent-loop)",
    "",
  ].join("\n")

  const out = join(docsRoot, "reference", "cli.mdx")
  await writeFile(out, body, "utf8")
  return out
}

if (process.argv[1]?.endsWith("gen-cli-reference.mjs")) {
  const out = await generateCliReference(resolveEcpRoot())
  console.log(`wrote ${out}`)
}
