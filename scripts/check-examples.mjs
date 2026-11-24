#!/usr/bin/env node
// Validate every example and every execution embedded in skills/*/SKILL.md against a built ECP
// checkout, in a throwaway ECP_HOME. Examples that need no secrets are also run.
//
//   npm run check:examples -- --ecp-root ../executioncontrolprotocol
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { docsRoot, resolveEcpRoot } from "./lib/reference-utils.mjs"

const ecpRoot = resolveEcpRoot()
const bin = join(ecpRoot, "packages", "cli", "bin", "run.js")
if (!existsSync(bin)) throw new Error(`${bin} not found; build the ECP checkout first (pnpm run build).`)
const home = mkdtempSync(join(tmpdir(), "ecp-examples-"))
const env = { ...process.env, ECP_HOME: home, ECP_HOST_IDLE_MINUTES: "2" }

/** @param {string[]} args @param {string} cwd */
function ecp(args, cwd = docsRoot) {
  try {
    return { ok: true, out: execFileSync(process.execPath, [bin, ...args], { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) }
  } catch (error) {
    return { ok: false, out: `${error.stdout ?? ""}${error.stderr ?? ""}` }
  }
}

const index = JSON.parse(readFileSync(join(docsRoot, "examples", "index.json"), "utf8"))
const failures = []
try {
  for (const plugin of new Set(index.examples.flatMap((e) => e.plugins))) {
    const linked = ecp(["plugins", "link", join(ecpRoot, "plugins", `plugin-${plugin}`), "--no-install"])
    if (!linked.ok) failures.push(`link ${plugin}: ${linked.out}`)
  }
  for (const config of index.configs) {
    const committed = ecp(["commit", "--type", "config", "--action", "create", "--object", `@${join(docsRoot, "examples", config)}`])
    if (!committed.ok) failures.push(`config ${config}: ${committed.out}`)
  }

  for (const example of index.examples) {
    const dir = join(docsRoot, "examples", example.name)
    for (const file of example.files.filter((f) => f.endsWith(".ecp.json"))) {
      const result = ecp(["execute", file, "--validate"], dir)
      console.log(`${result.ok ? "valid " : "INVALID"} examples/${example.name}/${file}`)
      if (!result.ok) failures.push(`examples/${example.name}/${file}\n${result.out}`)
    }
    if ((example.secrets ?? []).length === 0) {
      // "ecp execute file --input '{...}'" -> ["execute", "file", "--input", "{...}"]
      const args = example.run.match(/'[^']*'|\S+/g).slice(1).map((a) => a.replace(/^'|'$/g, ""))
      const run = ecp(args, dir)
      const ok = run.ok && /completed/.test(run.out)
      console.log(`${ok ? "ran   " : "FAILED "} examples/${example.name}: ${example.run}`)
      if (!ok) failures.push(`run examples/${example.name}\n${run.out}`)
    }
  }

  const scratch = mkdtempSync(join(tmpdir(), "ecp-skill-blocks-"))
  for (const skill of readdirSync(join(docsRoot, "skills"))) {
    const path = join(docsRoot, "skills", skill, "SKILL.md")
    if (!existsSync(path)) continue
    const blocks = [...readFileSync(path, "utf8").matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1])
    blocks.forEach((block, i) => {
      if (!block.includes('"@executioncontrolprotocol.execution"')) return
      const file = join(scratch, `${skill}-${i}.ecp.json`)
      writeFileSync(file, block)
      const result = ecp(["execute", file, "--validate"])
      console.log(`${result.ok ? "valid " : "INVALID"} skills/${skill}/SKILL.md block ${i}`)
      if (!result.ok) failures.push(`skills/${skill}/SKILL.md block ${i}\n${result.out}`)
    })
  }
  rmSync(scratch, { recursive: true, force: true })
} finally {
  ecp(["host", "stop", "--force"])
  rmSync(home, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):\n\n${failures.join("\n\n")}`)
  process.exit(1)
}
console.log("\nall examples valid")
