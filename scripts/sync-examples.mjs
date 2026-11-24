#!/usr/bin/env node
// Sync the example set and stamp the agent skills with the ECP version.
//
// Reads examples/catalog.json. Entries with an `ecp` block are copied from that folder of the
// ECP checkout; the rest are authored in this repo. Then writes, for every example:
//   examples/<name>/README.md         generated from the catalogue
//   examples/index.json               versioned manifest agents read after downloading
// and in skills/*/SKILL.md:
//   metadata.version                  the ECP CLI version these docs describe
//   the block between the [//]: # (examples:start) and (examples:end) markers
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { docsRoot, readJson, resolveEcpRoot } from "./lib/reference-utils.mjs"

const EXAMPLES = join(docsRoot, "examples")
const SKILLS = join(docsRoot, "skills")
const DOWNLOAD_DIR = "ecp-examples"
const TARBALL = "https://codeload.github.com/executioncontrolprotocol/docs/tar.gz/refs/heads/main"

/** @param {string} path @param {string} text */
async function writeText(path, text) {
  await writeFile(path, text.endsWith("\n") ? text : `${text}\n`, "utf8")
}

/** Remove the editor-only `$schema` line: it points at a machine-local file. */
async function copyExecution(from, to) {
  const manifest = JSON.parse(await readFile(from, "utf8"))
  delete manifest.$schema
  await writeText(to, JSON.stringify(manifest, null, 2))
}

/** @param {string} dir @param {string} [prefix] @returns {Promise<string[]>} */
async function listFiles(dir, prefix = "") {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...(await listFiles(join(dir, entry.name), rel)))
    else if (entry.name !== "README.md") out.push(rel)
  }
  return out.sort()
}

function readme(example, version) {
  const lines = [`# ${example.title}`, "", example.description, ""]
  lines.push(`Shows: ${example.shows.map((s) => `\`${s}\``).join(", ")}.`, "")
  lines.push(`Run the commands below from this folder (\`${DOWNLOAD_DIR}/${example.name}\`).`, "")
  if (example.plugins.length > 0) {
    lines.push("## Set up", "", "```bash")
    for (const plugin of example.plugins) lines.push(`ecp plugins install ${plugin}`)
    for (const config of example.configs ?? []) lines.push(`ecp commit --type config --action create --object @../configs/${config}`)
    for (const secret of example.secrets ?? []) lines.push(`ecp config secrets set ${secret}   # paste the value when prompted`)
    lines.push("```", "")
  }
  lines.push("## Run", "", "```bash", example.run, "```", "")
  lines.push(`Generated from \`examples/catalog.json\` for ECP ${version}. Do not edit by hand.`)
  return lines.join("\n")
}

function skillTable(index) {
  const rows = index.examples.map((e) => {
    const needs = e.plugins.length ? e.plugins.map((p) => `\`${p}\``).join(", ") : "core only"
    return `| \`${e.name}\` | ${e.description} | ${needs} |`
  })
  return [
    `Examples for ECP ${index.ecpVersion} (\`${DOWNLOAD_DIR}/index.json\` lists every file and run command):`,
    "",
    "| Example | What it shows | Plugins |",
    "| ------- | ------------- | ------- |",
    ...rows,
  ].join("\n")
}

export async function syncExamples(ecpRoot) {
  const cliPkg = await readJson(join(ecpRoot, "packages", "cli", "package.json"))
  const version = /** @type {{ version: string }} */ (cliPkg).version
  const catalog = /** @type {{ examples: any[] }} */ (await readJson(join(EXAMPLES, "catalog.json")))

  const entries = []
  for (const example of catalog.examples) {
    const dir = join(EXAMPLES, example.name)
    await mkdir(dir, { recursive: true })
    if (example.ecp) {
      for (const file of example.ecp.files) {
        const from = join(ecpRoot, example.ecp.dir, file)
        if (!existsSync(from)) throw new Error(`ECP example file not found: ${from}`)
        const to = join(dir, file)
        await mkdir(join(to, ".."), { recursive: true })
        if (file.endsWith(".ecp.json")) await copyExecution(from, to)
        else await copyFile(from, to)
      }
    }
    await writeText(join(dir, "README.md"), readme(example, version))
    const { ecp, ...rest } = example
    entries.push({
      ...rest,
      source: ecp ? `executioncontrolprotocol/executioncontrolprotocol/${ecp.dir}` : "executioncontrolprotocol/docs",
      files: await listFiles(dir),
    })
  }

  const index = {
    schema: "@executioncontrolprotocol.examples",
    ecpVersion: version,
    download: {
      macosLinux: `mkdir -p ${DOWNLOAD_DIR} && curl -fsSL ${TARBALL} | tar -xz --strip-components=2 -C ${DOWNLOAD_DIR} docs-main/examples`,
      windows: `mkdir ${DOWNLOAD_DIR} -Force; curl.exe -fsSL ${TARBALL} -o ecp-examples.tgz; tar -xzf ecp-examples.tgz --strip-components=2 -C ${DOWNLOAD_DIR} docs-main/examples; Remove-Item ecp-examples.tgz`,
    },
    configs: (await readdir(join(EXAMPLES, "configs"))).sort().map((f) => `configs/${f}`),
    examples: entries,
  }
  await writeText(join(EXAMPLES, "index.json"), JSON.stringify(index, null, 2))

  for (const skill of (await readdir(SKILLS, { withFileTypes: true })).filter((d) => d.isDirectory())) {
    const path = join(SKILLS, skill.name, "SKILL.md")
    if (!existsSync(path)) continue
    let text = await readFile(path, "utf8")
    text = text.replace(/^(\s+version:\s*)"[^"]*"/m, `$1"${version}"`)
    text = text.replace(
      /\[\/\/\]: # \(examples:start\)[\s\S]*?\[\/\/\]: # \(examples:end\)/,
      `[//]: # (examples:start)\n\n${skillTable(index)}\n\n[//]: # (examples:end)`
    )
    await writeText(path, text.trimEnd())
  }
  return join(EXAMPLES, "index.json")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`wrote ${await syncExamples(resolveEcpRoot())}`)
}
