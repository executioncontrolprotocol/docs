#!/usr/bin/env node
import { generateCliReference } from "./gen-cli-reference.mjs"
import { generateLlms } from "./gen-llms.mjs"
import { resolveEcpRoot } from "./lib/reference-utils.mjs"

const ecpRoot = resolveEcpRoot()
const cli = await generateCliReference(ecpRoot)
const llms = await generateLlms()
console.log(`wrote ${cli}`)
console.log(`wrote ${llms}`)
