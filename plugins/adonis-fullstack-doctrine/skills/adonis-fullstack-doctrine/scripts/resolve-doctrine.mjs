#!/usr/bin/env node
import { DEFAULT_MANIFEST, formatMarkdown, listSlices, loadManifest, resolveDoctrine } from './lib.mjs'

function usage() {
  console.log(`Usage:
  node scripts/resolve-doctrine.mjs --profile <web|web-mobile|api-only> [--surface <surface>] [--slice <slice> ...] [--format json|markdown]
  node scripts/resolve-doctrine.mjs --list-slices
  node scripts/resolve-doctrine.mjs --help

Options:
  --profile     Profil du projet (défaut : web)
  --surface     Surface HTTP (défaut : web, ou api.external pour api-only)
  --slice       Tranche de fonctionnalité, répétable
  --format      json (défaut) ou markdown
  --manifest    Chemin du manifeste
  --list-slices Liste les tranches disponibles
  --help        Affiche cette aide`)
}

function parseArgs(argv) {
  const options = { slices: [], format: 'json' }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = () => {
      index += 1
      if (index >= argv.length) throw new Error(`valeur manquante pour ${arg}`)
      return argv[index]
    }
    switch (arg) {
      case '--profile':
        options.profile = next()
        break
      case '--surface':
        options.surface = next()
        break
      case '--slice':
        options.slices.push(next())
        break
      case '--format':
        options.format = next()
        break
      case '--manifest':
        options.manifestPath = next()
        break
      case '--list-slices':
        options.listSlices = true
        break
      case '--help':
      case '-h':
        options.help = true
        break
      default:
        throw new Error(`option inconnue : ${arg}`)
    }
  }
  return options
}

try {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    usage()
    process.exit(0)
  }
  if (options.listSlices) {
    const manifest = loadManifest(options.manifestPath)
    console.log(JSON.stringify({ slices: listSlices(manifest) }, null, 2))
    process.exit(0)
  }
  if (!['json', 'markdown'].includes(options.format)) {
    throw new Error(`format inconnu : ${options.format}`)
  }
  const result = resolveDoctrine({
    profile: options.profile ?? 'web',
    surface: options.surface,
    slices: options.slices,
    manifestPath: options.manifestPath ?? DEFAULT_MANIFEST,
  })
  if (options.format === 'markdown') console.log(formatMarkdown(result))
  else console.log(JSON.stringify(result, null, 2))
} catch (error) {
  console.error(`resolve-doctrine: ${error.message}`)
  process.exit(2)
}
