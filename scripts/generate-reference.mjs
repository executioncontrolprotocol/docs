#!/usr/bin/env node
import { generateCliReference } from "./gen-cli-reference.mjs"
import { generatePluginCatalog } from "./gen-plugin-catalog.mjs"
import { generateLlms } from "./gen-llms.mjs"
import { resolveEcpRoot } from "./lib/reference-utils.mjs"

const ecpRoot = resolveEcpRoot()
const cli = await generateCliReference(ecpRoot)
const plugins = await generatePluginCatalog(ecpRoot)
const llms = await generateLlms()
console.log(`wrote ${cli}`)
console.log(`wrote ${plugins}`)
console.log(`wrote ${llms}`)
