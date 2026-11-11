#!/usr/bin/env node
import { listReferences, readReference } from './lib.mjs'

function usage() {
  console.log(`Usage:
  node scripts/read-reference.mjs --list
  node scripts/read-reference.mjs <fichier.md[#titre]>

Exemples:
  node scripts/read-reference.mjs setup.md#runtime
  node scripts/read-reference.mjs patterns/doctrine-learning.md#procedure`)
}

const args = process.argv.slice(2)
try {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    usage()
    process.exit(args.length === 0 ? 2 : 0)
  }
  if (args[0] === '--list') {
    console.log(listReferences().join('\n'))
    process.exit(0)
  }
  if (args.length > 1) throw new Error('un seul sélecteur attendu')
  console.log(readReference(args[0]))
} catch (error) {
  console.error(`read-reference: ${error.message}`)
  process.exit(2)
}
