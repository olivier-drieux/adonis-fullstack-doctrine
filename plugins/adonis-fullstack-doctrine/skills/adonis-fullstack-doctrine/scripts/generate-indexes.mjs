#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { assertValidManifest, buildIndex, DEFAULT_MANIFEST, loadManifest } from './lib.mjs'

function usage() {
  console.log(`Usage:
  node scripts/generate-indexes.mjs --write
  node scripts/generate-indexes.mjs --check

--write  Régénère rules/manifest-index.json depuis rules/manifest.json
--check  Vérifie que l'index est à jour sans écrire`)
}

const args = process.argv.slice(2)
const write = args.includes('--write')
const check = args.includes('--check')
const help = args.includes('--help') || args.includes('-h')

if (help) {
  usage()
  process.exit(0)
}
if (!write && !check) {
  usage()
  process.exit(2)
}

const manifestPath = DEFAULT_MANIFEST
const indexPath = join(dirname(manifestPath), 'manifest-index.json')

try {
  const manifest = loadManifest(manifestPath)
  assertValidManifest(manifest)
  const index = buildIndex(manifest)
  const serialized = `${JSON.stringify(index, null, 2)}\n`

  if (write) {
    writeFileSync(indexPath, serialized)
    console.log(`Index écrit : ${indexPath} (${index.rules.length} règles)`)
    process.exit(0)
  }

  if (!existsSync(indexPath)) {
    console.error(`Index absent : ${indexPath}. Lancez --write.`)
    process.exit(1)
  }
  const current = readFileSync(indexPath, 'utf8')
  if (current !== serialized) {
    console.error(`Index périmé : ${indexPath}. Lancez --write puis committez.`)
    process.exit(1)
  }
  console.log(`Index à jour (${index.rules.length} règles).`)
} catch (error) {
  console.error(`generate-indexes: ${error.message}`)
  process.exit(2)
}
