#!/usr/bin/env node
import { writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import {
  commandLine,
  docsRoot,
  firstParagraph,
  mdxEscape,
  readJson,
  resolveEcpRoot,
} from "./lib/reference-utils.mjs"

/**
 * @typedef {{
 *   id: string
 *   summary?: string
 *   description?: string
 *   examples?: (string | { command?: string, description?: string })[]
 *   aliases?: string[]
 *   flags?: Record<string, Flag>
 *   args?: Record<string, Arg>
 *   hidden?: boolean
 * }} ManifestCommand

 * @typedef {{
 *   name?: string
 *   description?: string
 *   required?: boolean
 *   hidden?: boolean
 *   type?: string
 *   char?: string
 *   default?: unknown
 *   options?: string[]
 * }} Flag

 * @typedef {{
 *   name?: string
 *   description?: string
 *   required?: boolean
 *   hidden?: boolean
 * }} Arg
 */

/** @type {{ title: string, ids: string[] }[]} */
const COMMAND_GROUPS = [
  { title: "Operations", ids: ["retrieve", "execute", "commit"] },
  {
    title: "Host",
    ids: ["host:start", "host:stop", "host:status", "host:restart", "host:reload", "host:logs"],
  },
  { title: "App", ids: ["app"] },
  { title: "MCP", ids: ["mcp:start"] },
  {
    title: "Plugins",
    ids: [
      "plugins",
      "plugins:install",
      "plugins:link",
      "plugins:uninstall",
      "plugins:update",
      "plugins:reset",
      "plugins:inspect",
    ],
  },
  {
    title: "Config",
    ids: ["config:secrets:set", "config:secrets:list", "config:secrets:unset"],
  },
]

/**
 * @param {string} ecpRoot
 * @returns {Promise<ManifestCommand[]>}
 */
async function loadCommands(ecpRoot) {
  const cliManifest = join(ecpRoot, "packages", "cli", "oclif.manifest.json")
  if (!existsSync(cliManifest)) {
    throw new Error(
      `CLI oclif manifest not found at ${cliManifest}. Pass --ecp-root to an ECP checkout that commits packages/cli/oclif.manifest.json.`
    )
  }
  return commandsFromManifest(/** @type {{ commands?: Record<string, ManifestCommand> }} */ (
    await readJson(cliManifest)
  ))
}

/**
 * @param {{ commands?: Record<string, ManifestCommand> }} manifest
 * @returns {ManifestCommand[]}
 */
function commandsFromManifest(manifest) {
  const entries = Object.values(manifest.commands ?? {})
  const aliasIds = new Set()
  for (const command of entries) {
    for (const alias of command.aliases ?? []) {
      if (alias !== command.id) aliasIds.add(alias)
    }
  }
  return entries
    .filter((command) => !command.hidden && !aliasIds.has(command.id))
    .map((command) => ({
      ...command,
      aliases: (command.aliases ?? []).filter((alias) => alias !== command.id),
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
 * @param {string} commandId
 */
function commandWords(commandId) {
  return commandId.replaceAll(":", " ")
}

/**
 * @param {string | { command?: string, description?: string }} example
 * @param {string} commandId
 */
function formatExampleLine(example, commandId) {
  const raw =
    typeof example === "string" ? example : (example.command ?? "")
  const words = commandWords(commandId)
  return sanitizeExample(
    raw.replace(/<%= config\.bin %>/g, "ecp").replace(/<%= command\.id %>/g, words)
  )
}

/**
 * @param {unknown} value
 */
function formatDefault(value) {
  if (value === undefined || value === null) return "—"
  if (typeof value === "string") return value
  return String(value)
}

/**
 * @param {string} text
 */
function tableCell(text) {
  return mdxEscape(String(text ?? "")).replaceAll("|", "\\|")
}

/**
 * @param {Flag} flag
 */
function flagColumn(flag) {
  const name = flag.name ?? "flag"
  const long = `--${name}`
  return flag.char ? `${long}/-${flag.char}` : long
}

/**
 * @param {ManifestCommand} command
 */
function usageLine(command) {
  const base = commandLine(command.id)
  const argParts = Object.values(command.args ?? {})
    .filter((arg) => !arg.hidden)
    .map((arg) => `[${arg.name ?? "arg"}]`)
  if (argParts.length > 0) {
    return `${base} ${argParts.join(" ")} [FLAGS]`
  }
  return `${base} [FLAGS]`
}

/**
 * @param {ManifestCommand} command
 */
function renderCommand(command) {
  const heading = commandLine(command.id)
  const summary = command.summary ?? firstParagraph(command.description) ?? command.id
  const lines = [`### \`${heading}\``, "", tableCell(summary)]

  if (command.summary) {
    const description = firstParagraph(command.description)
    if (description && description !== summary) {
      lines.push("", tableCell(description))
    }
  }

  if (command.id === "host:reload") {
    lines.push("", "Equivalent to `ecp host restart`.")
  }

  lines.push("", "#### Usage", "", "```bash", usageLine(command), "```")

  const argEntries = Object.values(command.args ?? {}).filter((arg) => !arg.hidden)
  if (argEntries.length > 0) {
    lines.push("", "#### Arguments", "", "| Name | Required | Description |", "| --- | --- | --- |")
    for (const arg of argEntries) {
      const name = arg.name ?? "arg"
      const required = arg.required ? "yes" : "no"
      lines.push(
        `| \`${name}\` | ${required} | ${tableCell(arg.description ?? "")} |`
      )
    }
  }

  const flagEntries = Object.values(command.flags ?? {}).filter((flag) => !flag.hidden)
  if (flagEntries.length > 0) {
    lines.push(
      "",
      "#### Flags",
      "",
      "| Flag | Type | Default | Allowed options | Description |",
      "| --- | --- | --- | --- | --- |"
    )
    for (const flag of flagEntries) {
      const options =
        Array.isArray(flag.options) && flag.options.length > 0
          ? flag.options.join(", ")
          : "—"
      lines.push(
        `| \`${flagColumn(flag)}\` | ${flag.type ?? "option"} | ${tableCell(formatDefault(flag.default))} | ${tableCell(options)} | ${tableCell(flag.description ?? "")} |`
      )
    }
  }

  if (command.aliases && command.aliases.length > 0) {
    lines.push(
      "",
      "#### Aliases",
      "",
      command.aliases.map((alias) => `- \`${commandLine(alias)}\``).join("\n")
    )
  }

  const examples = (command.examples ?? []).filter(Boolean)
  if (examples.length > 0) {
    lines.push("", "#### Examples", "", "```bash")
    for (const example of examples) {
      const desc = typeof example === "object" && example.description ? example.description : ""
      if (desc) {
        lines.push(`# ${desc}`)
      }
      lines.push(formatExampleLine(example, command.id))
    }
    lines.push("```")
  }

  lines.push("")
  return lines.join("\n")
}

/**
 * @param {ManifestCommand[]} commands
 */
function groupCommands(commands) {
  const byId = new Map(commands.map((command) => [command.id, command]))
  const assigned = new Set()
  /** @type { { title: string, commands: ManifestCommand[] }[] } */
  const sections = []

  for (const group of COMMAND_GROUPS) {
    /** @type {ManifestCommand[]} */
    const bucket = []
    for (const id of group.ids) {
      const command = byId.get(id)
      if (command) {
        bucket.push(command)
        assigned.add(id)
      }
    }
    if (bucket.length > 0) {
      sections.push({ title: group.title, commands: bucket })
    }
  }

  const other = commands
    .filter((command) => !assigned.has(command.id))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (other.length > 0) {
    sections.push({ title: "Other", commands: other })
  }

  return sections
}

/**
 * @param {string} ecpRoot
 */
export async function generateCliReference(ecpRoot) {
  const commands = await loadCommands(ecpRoot)
  const sections = groupCommands(commands)

  const body = [
    "---",
    'title: "CLI reference"',
    'description: "Every ecp command, flag, and argument in ECP (Execution Control Protocol), generated from the CLI\'s oclif manifest."',
    "---",
    "",
    "{/* Generated by scripts/gen-cli-reference.mjs from packages/cli/oclif.manifest.json. Do not edit by hand; run npm run generate:reference. */}",
    "",
    "Every `ecp` command, generated from the CLI itself. Run `ecp <command> --help` for the same information in your terminal.",
    "",
    "Every command except `ecp mcp start` accepts `--json` and prints one envelope on stdout: `{ ok: true, data }` on success or `{ ok: false, error }` on failure. See [Operations](/reference/operations) for the shapes.",
    "",
    "| Exit code | Meaning |",
    "| --- | --- |",
    "| `0` | Success, including a valid validation and a completed run |",
    "| `1` | The run failed or was cancelled, or an internal error |",
    "| `2` | Invalid request or execution |",
    "| `3` | A required plugin is missing |",
    "| `4` | Host unavailable or unauthorized |",
    "",
    "See [Error codes](/reference/error-codes) for every code.",
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      ...section.commands.map(renderCommand),
    ]),
  ].join("\n")

  const out = join(docsRoot, "reference", "cli.mdx")
  await writeFile(out, body, "utf8")
  return out
}

if (process.argv[1]?.endsWith("gen-cli-reference.mjs")) {
  const out = await generateCliReference(resolveEcpRoot())
  console.log(`wrote ${out}`)
}