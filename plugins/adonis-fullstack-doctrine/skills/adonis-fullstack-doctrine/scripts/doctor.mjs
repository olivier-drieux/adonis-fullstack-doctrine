#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const IGNORED = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.expo',
  'coverage',
  '.turbo',
  '.next',
  '.cache',
])
const SOURCE_EXT = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/
const DOMAIN_DIRS = new Set(['agenda', 'documents', 'projects', 'visits', 'summaries', 'invitations'])

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function readText(file) {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function has(file) {
  return existsSync(file)
}

function walk(directory, files = []) {
  if (!has(directory)) return files
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED.has(entry.name) || entry.isSymbolicLink()) continue
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) walk(absolute, files)
    else if (entry.isFile()) files.push(absolute)
  }
  return files
}

function locate(root, name) {
  for (const base of ['apps', 'packages']) {
    const candidate = join(root, base, name)
    if (has(candidate)) return candidate
  }
  return null
}

function packageAt(root, name) {
  const directory = locate(root, name)
  return directory ? readJson(join(directory, 'package.json')) : null
}

function dependency(pkg, name) {
  return Boolean(pkg?.dependencies?.[name] || pkg?.devDependencies?.[name])
}

function filesMatching(directory, pattern) {
  return walk(directory)
    .filter((file) => SOURCE_EXT.test(file))
    .filter((file) => pattern.test(readText(file)))
}

function isTestFile(file) {
  return (
    /(?:^|[\\/])(?:__tests__|tests?|fixtures?|smoke)[\\/]/.test(file) ||
    /\.(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(file)
  )
}

function countMatches(directory, pattern, { skipTests = false } = {}) {
  let count = 0
  for (const file of walk(directory)) {
    if (!SOURCE_EXT.test(file)) continue
    if (skipTests && isTestFile(file)) continue
    const content = readText(file)
    const matches = content.match(pattern)
    if (matches) count += matches.length
  }
  return count
}

function check(id, rule, status, message, evidence, recommendation = null) {
  return { id, rule, status, message, evidence, recommendation }
}

function applyException(result, exceptions) {
  if (!['fail', 'warn'].includes(result.status)) return result
  const exception = exceptions[result.rule]
  if (!exception) return result
  const reason = typeof exception === 'string' ? exception : exception.reason
  return {
    ...result,
    status: 'exception',
    message: `${result.message} — exception documentée${reason ? ` : ${reason}` : ''}`,
  }
}

function summarize(checks) {
  return checks.reduce(
    (summary, item) => {
      summary[item.status] = (summary[item.status] ?? 0) + 1
      return summary
    },
    { pass: 0, warn: 0, fail: 0, exception: 0, unknown: 0 },
  )
}

export function runDoctor({ root, profile = 'web-mobile' }) {
  const projectRoot = resolve(root)
  const rootPkg = readJson(join(projectRoot, 'package.json')) ?? {}
  const workspace = readText(join(projectRoot, 'pnpm-workspace.yaml'))
  const exceptions = readJson(join(projectRoot, '.doctrine-exceptions.json')) ?? {}
  const api = locate(projectRoot, 'api')
  const web = locate(projectRoot, 'web')
  const mobile = locate(projectRoot, 'mobile')
  const ui = locate(projectRoot, 'ui')
  const apiClient = locate(projectRoot, 'api-client')
  const checks = []

  // Runtime
  const nodeRange = rootPkg.engines?.node ?? ''
  const nodeFile = (readText(join(projectRoot, '.node-version')) || readText(join(projectRoot, '.nvmrc'))).trim()
  const nodeOk = /(?:>=|\^)?\s*24\b/.test(nodeRange) || nodeFile.startsWith('24')
  checks.push(
    check(
      'stack.node',
      'hb.stack-baseline',
      nodeOk ? 'pass' : 'fail',
      nodeOk ? 'Node 24 est déclaré.' : 'Node 24 n’est pas déclaré dans engines ou dans .node-version.',
      'package.json#engines.node',
      'Déclarer Node >= 24 dans engines et dans .node-version.',
    ),
  )

  // Workspace
  const packageManager = rootPkg.packageManager ?? ''
  const hasWorkspace = workspace.length > 0
  const pnpmOk =
    packageManager.startsWith('pnpm@') &&
    /nodeLinker:\s*hoisted/.test(workspace) &&
    /strictPeerDependencies:\s*true/.test(workspace) &&
    /saveExact:\s*true/.test(workspace) &&
    /verifyDepsBeforeRun:\s*error/.test(workspace)
  checks.push(
    check(
      'stack.pnpm',
      'hb.stack-pnpm-monorepo',
      hasWorkspace && pnpmOk ? 'pass' : 'fail',
      hasWorkspace
        ? pnpmOk
          ? 'Workspace pnpm strict et hoisted.'
          : 'Le workspace pnpm n’a pas les réglages attendus (hoisted, peers stricts, exact, verify).'
        : 'Aucun pnpm-workspace.yaml.',
      'pnpm-workspace.yaml',
      'Ajouter nodeLinker: hoisted, strictPeerDependencies: true, saveExact: true et verifyDepsBeforeRun: error.',
    ),
  )

  const hasAppsLayout = Boolean(
    api && relative(projectRoot, api).startsWith('apps') && web && relative(projectRoot, web).startsWith('apps'),
  )
  const hasPackagesLayout = Boolean(
    api && relative(projectRoot, api).startsWith('packages') && web && relative(projectRoot, web).startsWith('packages'),
  )
  checks.push(
    check(
      'stack.layout',
      'hb.stack-layout',
      hasAppsLayout ? 'pass' : 'fail',
      hasAppsLayout
        ? 'Layout apps/ + packages/.'
        : hasPackagesLayout
          ? 'Layout packages/* détecté : applications et bibliothèques sont mélangées.'
          : 'Layout apps/ + packages/ introuvable.',
      'apps/api, apps/web',
      'Utiliser apps/ pour les applications et packages/ pour les bibliothèques.',
    ),
  )

  // Web build
  const webVite = web ? join(web, 'vite.config.ts') : null
  const webViteContent = webVite ? readText(webVite) : ''
  const webBuildOk =
    webViteContent.includes('buildDirectory') && webViteContent.includes('api/public/assets')
  checks.push(
    check(
      'stack.web-build',
      'hb.stack-web-build',
      webBuildOk ? 'pass' : 'fail',
      webBuildOk
        ? 'Le web compile vers apps/api/public/assets.'
        : 'Le build web ne pointe pas vers api/public/assets.',
      webVite ? relative(projectRoot, webVite) : 'apps/web/vite.config.ts',
      'Configurer @adonisjs/vite/client avec buildDirectory vers ../api/public/assets.',
    ),
  )

  // MariaDB
  const database = api ? readText(join(api, 'config', 'database.ts')) : ''
  const apiPkg = api ? readJson(join(api, 'package.json')) : null
  const usesMysql = /client:\s*['"]mysql2['"]/.test(database) || dependency(apiPkg, 'mysql2')
  const usesPostgres = /client:\s*['"]pg['"]/.test(database) || dependency(apiPkg, 'pg')
  checks.push(
    check(
      'stack.mariadb',
      'hb.stack-mariadb',
      usesPostgres ? 'fail' : usesMysql ? 'pass' : 'warn',
      usesPostgres
        ? 'PostgreSQL est configuré au lieu de MariaDB.'
        : usesMysql
          ? 'MariaDB/mysql2 est configuré.'
          : 'Aucune configuration MariaDB/mysql2 détectée.',
      'config/database.ts',
      'Utiliser Lucid avec le client mysql2 sur MariaDB.',
    ),
  )

  // Queue
  const queue = api ? readText(join(api, 'config', 'queue.ts')) : ''
  const queueDriver = /drivers\.redis/.test(queue) ? 'redis' : /drivers\.database/.test(queue) ? 'database' : 'none'
  checks.push(
    check(
      'stack.queue',
      'hb.stack-redis-queue',
      queueDriver === 'redis' ? 'pass' : queueDriver === 'database' ? 'fail' : 'warn',
      queueDriver === 'redis'
        ? 'Queue Redis configurée.'
        : queueDriver === 'database'
          ? 'Queue database configurée au lieu de Redis.'
          : 'Aucune configuration de queue détectée.',
      'config/queue.ts',
      'Configurer @adonisjs/queue avec le driver Redis et un health check.',
    ),
  )

  // Tuyau
  const apiClientPkg = api ? readJson(join(api, 'package.json')) : null
  const hasRegistry = apiClient ? has(join(apiClient, 'src', 'registry')) || has(join(apiClient, 'registry')) : false
  const hasGenerateScript = Boolean(apiClientPkg?.scripts?.['generate:api-client'] || rootPkg.scripts?.['generate:api-client'])
  checks.push(
    check(
      'stack.tuyau',
      'hb.stack-tuyau',
      hasRegistry && hasGenerateScript ? 'pass' : 'warn',
      hasRegistry && hasGenerateScript
        ? 'Registre Tuyau et script de génération présents.'
        : 'Registre Tuyau ou script de génération manquant.',
      'packages/api-client',
      'Générer le registre et le committer à chaque changement de route.',
    ),
  )

  // Tamagui
  const uiPkg = ui ? readJson(join(ui, 'package.json')) : null
  const webPkg = web ? readJson(join(web, 'package.json')) : null
  const mobilePkg = mobile ? readJson(join(mobile, 'package.json')) : null
  const forbiddenUi = ['@mantine/core', '@gluestack-ui/themed', 'nativewind', 'react-native-paper'].filter(
    (name) => dependency(webPkg, name) || dependency(mobilePkg, name) || dependency(rootPkg, name),
  )
  const hasTamagui = dependency(uiPkg, 'tamagui') || dependency(webPkg, 'tamagui') || dependency(mobilePkg, 'tamagui')
  checks.push(
    check(
      'ui.tamagui',
      'hb.stack-tamagui',
      forbiddenUi.length > 0 ? 'fail' : hasTamagui ? 'pass' : 'warn',
      forbiddenUi.length > 0
        ? `Bibliothèque UI interdite détectée : ${forbiddenUi.join(', ')}.`
        : hasTamagui
          ? 'Tamagui est présent.'
          : 'Tamagui non détecté.',
      'package.json',
      'Utiliser Tamagui comme unique bibliothèque de composants.',
    ),
  )

  const directTamagui = [
    ...filesMatching(web ? join(web, 'src') : '', /from\s+['"]tamagui['"]/),
    ...filesMatching(mobile ? join(mobile, 'src') : '', /from\s+['"]tamagui['"]/),
  ]
  checks.push(
    check(
      'ui.imports',
      'hb.ui-imports',
      directTamagui.length === 0 ? 'pass' : 'fail',
      directTamagui.length === 0
        ? 'Aucun import direct de tamagui dans les applications.'
        : `${directTamagui.length} fichier(s) importent tamagui directement.`,
      directTamagui.slice(0, 5).map((file) => relative(projectRoot, file)).join(', ') || 'apps/web, apps/mobile',
      'Importer les primitives depuis @scope/ui.',
    ),
  )

  const domainFiles = ui
    ? walk(join(ui, 'src')).filter((file) => {
        if (isTestFile(file)) return false
        const parts = relative(join(ui, 'src'), file).split(/[\\/]/)
        return parts.some((part) => DOMAIN_DIRS.has(part)) && /\.(?:tsx|ts)$/.test(file)
      })
    : []
  checks.push(
    check(
      'ui.boundary',
      'hb.ui-shared-boundary',
      domainFiles.length === 0 ? 'pass' : 'warn',
      domainFiles.length === 0
        ? 'Aucun composant métier évident dans packages/ui.'
        : `${domainFiles.length} fichier(s) métier dans packages/ui.`,
      domainFiles.slice(0, 5).map((file) => relative(projectRoot, file)).join(', ') || 'packages/ui/src',
      'Déplacer les composants métier dans l’application ou un package de feature.',
    ),
  )

  // Mobile forms
  if (profile === 'web-mobile' && mobile) {
    const tanstackForm = dependency(mobilePkg, '@tanstack/react-form')
    checks.push(
      check(
        'forms.mobile',
        'hb.forms-mobile-tanstack',
        tanstackForm ? 'pass' : 'fail',
        tanstackForm ? 'TanStack Form est installé côté mobile.' : 'TanStack Form n’est pas installé côté mobile.',
        'apps/mobile/package.json',
        'Installer @tanstack/react-form et passer par @scope/ui/form.',
      ),
    )
  }

  // API client
  if (profile === 'web-mobile' && mobile) {
    const mobileSrc = join(mobile, 'src')
    const mobileApp = join(mobile, 'app')
    const transportPattern = /(?:createApiClient|createTuyau)\s*\(/g
    const transports =
      countMatches(mobileSrc, transportPattern, { skipTests: true }) +
      countMatches(mobileApp, transportPattern, { skipTests: true })
    const facades =
      countMatches(mobileSrc, /createTuyauReactQueryClient\s*\(/g, { skipTests: true }) +
      countMatches(mobileApp, /createTuyauReactQueryClient\s*\(/g, { skipTests: true })
    const queryClients =
      countMatches(mobileSrc, /new QueryClient\s*\(/g, { skipTests: true }) +
      countMatches(mobileApp, /new QueryClient\s*\(/g, { skipTests: true })
    const transportOk = transports === 1 && queryClients <= 1
    checks.push(
      check(
        'api.transport',
        'hb.api-client-single',
        transportOk ? 'pass' : 'fail',
        transportOk
          ? `Un transport et ${queryClients} QueryClient(s).`
          : `${transports} transport(s) et ${queryClients} QueryClient(s).`,
        'apps/mobile/src, apps/mobile/app',
        'Garder un seul transport HTTP et un seul QueryClient.',
      ),
    )

    const facadeOk = facades <= 1
    checks.push(
      check(
        'api.facade',
        'ed.api-facade-single',
        facadeOk ? 'pass' : 'warn',
        facades === 0
          ? 'Aucune façade Tuyau détectée.'
          : facadeOk
            ? 'Une façade Tuyau partagée.'
            : `${facades} façades Tuyau recréées par feature.`,
        'apps/mobile/src, apps/mobile/app',
        'Créer la façade une fois et la partager via useApi(client) ou un contexte.',
      ),
    )
  }

  // Observability
  const sentry = ['@sentry/node', '@sentry/react', '@sentry/react-native'].some(
    (name) =>
      dependency(rootPkg, name) ||
      dependency(webPkg, name) ||
      dependency(mobilePkg, name) ||
      dependency(apiPkg, name),
  )
  checks.push(
    check(
      'ops.sentry',
      'ed.ops-sentry',
      sentry ? 'pass' : 'warn',
      sentry ? 'Sentry est présent.' : 'Sentry non détecté.',
      'package.json',
      'Initialiser Sentry côté API, web et mobile.',
    ),
  )

  const composePath = has(join(projectRoot, 'compose.yaml'))
    ? join(projectRoot, 'compose.yaml')
    : has(join(projectRoot, 'docker-compose.yml'))
      ? join(projectRoot, 'docker-compose.yml')
      : null
  const compose = composePath ? readText(composePath) : ''
  const composeOk = compose.includes('mariadb') && compose.includes('caddy')
  checks.push(
    check(
      'ops.compose',
      'ed.ops-compose',
      composeOk ? 'pass' : 'warn',
      composeOk ? 'Compose contient MariaDB et Caddy.' : 'Compose incomplet ou absent.',
      composePath ? relative(projectRoot, composePath) : 'compose.yaml',
      'Fournir API, MariaDB, Caddy, health checks et sauvegardes.',
    ),
  )

  const logger = api ? readText(join(api, 'config', 'logger.ts')) : ''
  checks.push(
    check(
      'ops.logs',
      'hb.ops-logs',
      /redact/.test(logger) ? 'pass' : 'fail',
      /redact/.test(logger) ? 'La configuration de logs contient redact.' : 'Aucune configuration redact détectée.',
      'config/logger.ts',
      'Configurer pino redact pour les tokens, cookies et champs personnels.',
    ),
  )

  // Testing
  const testsRoot = api ? join(api, 'tests') : null
  const hasFunctional = testsRoot ? has(join(testsRoot, 'functional')) : false
  const hasUnit = testsRoot ? has(join(testsRoot, 'unit')) : false
  checks.push(
    check(
      'testing.layout',
      'ed.testing-layout',
      hasFunctional && hasUnit ? 'pass' : 'warn',
      hasFunctional && hasUnit
        ? 'tests/functional et tests/unit présents.'
        : 'Arborescence de tests incomplète.',
      'apps/api/tests',
      'Séparer tests fonctionnels et tests unitaires.',
    ),
  )

  const gate = Object.keys(rootPkg.scripts ?? {}).some((name) => name === 'verify' || name.startsWith('verify:'))
  checks.push(
    check(
      'testing.gate',
      'ed.gate-generic',
      gate ? 'pass' : 'warn',
      gate ? 'Un script verify est présent.' : 'Aucun script verify détecté.',
      'package.json#scripts',
      'Ajouter un gate générique et des extensions de domaine.',
    ),
  )

  const withExceptions = checks.map((item) => applyException(item, exceptions))
  return {
    project: projectRoot,
    profile,
    checks: withExceptions,
    summary: summarize(withExceptions),
  }
}

export function formatDoctorMarkdown(result) {
  const lines = [
    '# Doctrine doctor',
    '',
    `- Projet : \`${result.project}\``,
    `- Profil : \`${result.profile}\``,
    `- Résumé : ${Object.entries(result.summary)
      .map(([status, count]) => `${status}=${count}`)
      .join(', ')}`,
    '',
  ]
  const groups = [
    ['fail', 'Échecs'],
    ['warn', 'Avertissements'],
    ['exception', 'Exceptions documentées'],
    ['pass', 'Conformes'],
    ['unknown', 'Inconnus'],
  ]
  for (const [status, title] of groups) {
    const items = result.checks.filter((item) => item.status === status)
    if (items.length === 0) continue
    lines.push(`## ${title}`)
    lines.push('')
    for (const item of items) {
      lines.push(`- \`${item.rule}\` (${item.id}) — ${item.message}`)
      if (item.evidence) lines.push(`  Preuve : \`${item.evidence}\``)
      if (item.recommendation) lines.push(`  Correction : ${item.recommendation}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function parseArgs(argv) {
  const options = { path: process.cwd(), profile: 'web-mobile', format: 'markdown' }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = () => {
      index += 1
      if (index >= argv.length) throw new Error(`valeur manquante pour ${arg}`)
      return argv[index]
    }
    if (arg === '--path') options.path = next()
    else if (arg === '--profile') options.profile = next()
    else if (arg === '--format') options.format = next()
    else if (arg === '--help' || arg === '-h') options.help = true
    else throw new Error(`option inconnue : ${arg}`)
  }
  return options
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseArgs(process.argv.slice(2))
    if (options.help) {
      console.log(`Usage:
  node scripts/doctor.mjs [--path <projet>] [--profile web|web-mobile|api-only] [--format markdown|json]

Lit un projet et vérifie les règles de la doctrine. Sans --path, le dossier courant est analysé. Les écarts acceptés se déclarent dans
\`.doctrine-exceptions.json\` à la racine du projet :
{
  "hb.stack-layout": { "reason": "DEC-476", "date": "2026-11-07" }
}`)
      process.exit(0)
    }
    if (!['markdown', 'json'].includes(options.format)) throw new Error(`format inconnu : ${options.format}`)
    const result = runDoctor({ root: options.path, profile: options.profile })
    console.log(options.format === 'json' ? JSON.stringify(result, null, 2) : formatDoctorMarkdown(result))
    process.exit(result.summary.fail > 0 ? 1 : 0)
  } catch (error) {
    console.error(`doctor: ${error.message}`)
    process.exit(2)
  }
}
