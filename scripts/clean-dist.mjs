import { rmSync, existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))

/** Top-level coverage / V8 dump directories produced by local or CI runs. */
const COVERAGE_DIRS = ["coverage", "coverage-tmp", "v8-cov", ".coverage", "@coverage"]

function removePath(p) {
  rmSync(p, { recursive: true, force: true })
}

/** Remove Vitest/V8 coverage output directories at the repo root. */
function cleanCoverage() {
  for (const name of COVERAGE_DIRS) {
    const p = join(root, name)
    if (existsSync(p)) removePath(p)
  }
}

const mode = process.argv[2] ?? "all"

// If NODE_V8_COVERAGE is set, Node rewrites the dump dir on process exit — clear it
// before deleting so `clean:coverage` does not recreate `v8-cov/`.
if (mode === "coverage" || mode === "all") {
  delete process.env.NODE_V8_COVERAGE
}

if (mode === "coverage") {
  cleanCoverage()
} else if (mode === "dist") {
  // Docs has no package dist trees; keep the flag for script parity with other repos.
} else {
  cleanCoverage()
}
