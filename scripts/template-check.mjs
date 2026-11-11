#!/usr/bin/env node
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { runDoctor } from '../plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/scripts/doctor.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES = join(REPO_ROOT, 'templates')
const FORBIDDEN_UI = ['@mantine/core', '@gluestack-ui/themed', 'nativewind', 'react-native-paper']

const REQUIRED_WEB = [
  'package.json',
  'pnpm-workspace.yaml',
  'apps/api/package.json',
  'apps/api/config/database.ts',
  'apps/api/config/queue.ts',
  'apps/api/config/logger.ts',
  'apps/api/start/routes.ts',
  'apps/api/tests/functional/.keep',
  'apps/api/tests/unit/.keep',
  'apps/web/package.json',
  'apps/web/vite.config.ts',
  'apps/web/src/app.tsx',
  'apps/web/src/pages/home.tsx',
  'packages/ui/package.json',
  'packages/ui/src/index.ts',
  'packages/api-client/package.json',
  'packages/api-client/src/registry/index.ts',
  'packages/shared-types/package.json',
  'compose.yaml',
  'Caddyfile',
  'scripts/verify.mjs',
]

const REQUIRED_MOBILE = [
  'apps/mobile/package.json',
  'apps/mobile/app/_layout.tsx',
  'apps/mobile/app/index.tsx',
  'apps/mobile/app.config.ts',
  'apps/mobile/metro.config.js',
  'apps/mobile/src/api/client.ts',
]

const errors = []

for (const file of REQUIRED_WEB) {
  if (!existsSync(join(TEMPLATES, 'web', 'files', file))) {
    errors.push(`template web : fichier manquant ${file}`)
  }
}
for (const file of REQUIRED_MOBILE) {
  if (!existsSync(join(TEMPLATES, 'web-mobile', 'files', file))) {
    errors.push(`template web-mobile : fichier manquant ${file}`)
  }
}

function walk(directory, files = []) {
  if (!existsSync(directory)) return files
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) walk(absolute, files)
    else if (entry.isFile()) files.push(absolute)
  }
  return files
}

for (const file of walk(TEMPLATES)) {
  if (!file.endsWith('package.json')) continue
  let pkg
  try {
    pkg = JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`${relative(REPO_ROOT, file)} : JSON invalide (${error.message})`)
    continue
  }
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
  for (const forbidden of FORBIDDEN_UI) {
    if (dependencies[forbidden]) {
      errors.push(`${relative(REPO_ROOT, file)} : dépendance UI interdite ${forbidden}`)
    }
  }
}

if (errors.length === 0) {
  const web = runDoctor({ root: join(TEMPLATES, 'web', 'files'), profile: 'web' })
  if (web.summary.fail > 0) {
    errors.push(`template web : ${web.summary.fail} échec(s) au doctor`)
    for (const item of web.checks.filter((check) => check.status === 'fail')) {
      errors.push(`- ${item.rule} : ${item.message}`)
    }
  }

  const temporary = mkdtempSync(join(tmpdir(), 'doctrine-template-'))
  try {
    cpSync(join(TEMPLATES, 'web', 'files'), temporary, { recursive: true })
    cpSync(join(TEMPLATES, 'web-mobile', 'files'), temporary, { recursive: true })
    const mobile = runDoctor({ root: temporary, profile: 'web-mobile' })
    if (mobile.summary.fail > 0) {
      errors.push(`template web-mobile : ${mobile.summary.fail} échec(s) au doctor`)
      for (const item of mobile.checks.filter((check) => check.status === 'fail')) {
        errors.push(`- ${item.rule} : ${item.message}`)
      }
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
}

if (errors.length > 0) {
  console.error(`Templates invalides : ${errors.length}`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Templates valides : ${REQUIRED_WEB.length} fichiers web, ${REQUIRED_MOBILE.length} fichiers mobiles, doctor vert.`)
