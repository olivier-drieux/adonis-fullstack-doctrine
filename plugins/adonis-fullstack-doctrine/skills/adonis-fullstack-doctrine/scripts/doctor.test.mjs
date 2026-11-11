import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { formatDoctorMarkdown, runDoctor } from './doctor.mjs'

function createProject() {
  return mkdtempSync(join(tmpdir(), 'doctrine-doctor-'))
}

function write(root, file, content) {
  const absolute = join(root, file)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, content)
}

function json(value) {
  return JSON.stringify(value, null, 2)
}

function compliant(root, layout = 'apps') {
  write(
    root,
    'package.json',
    json({
      engines: { node: '>=24' },
      packageManager: 'pnpm@12.9.1',
      scripts: { verify: 'node scripts/verify.mjs' },
    }),
  )
  write(
    root,
    'pnpm-workspace.yaml',
    `packages:\n  - ${layout}/*\n  - packages/*\nstrictPeerDependencies: true\nautoInstallPeers: false\nnodeLinker: hoisted\nverifyDepsBeforeRun: error\nsaveExact: true\n`,
  )
  write(
    root,
    `${layout}/api/package.json`,
    json({
      dependencies: { mysql2: '3.0.0', '@adonisjs/queue': '0.6.2', '@sentry/node': '10.0.0' },
      scripts: { 'generate:api-client': 'node scripts/generate.mjs' },
    }),
  )
  write(root, `${layout}/api/config/database.ts`, "export default { client: 'mysql2' }\n")
  write(root, `${layout}/api/config/queue.ts`, 'import { drivers } from "@adonisjs/queue"\nexport default { connections: { redis: drivers.redis({}) } }\n')
  write(root, `${layout}/api/config/logger.ts`, 'export default { redact: { paths: ["token"] } }\n')
  write(root, `${layout}/api/tests/functional/.keep`, '')
  write(root, `${layout}/api/tests/unit/.keep`, '')
  write(
    root,
    `${layout}/web/package.json`,
    json({ dependencies: { tamagui: '3.2.0', '@inertiajs/react': '3.9.1' } }),
  )
  write(root, `${layout}/web/vite.config.ts`, 'buildDirectory: resolve(import.meta.dirname, "../api/public/assets")\n')
  write(
    root,
    `${layout}/mobile/package.json`,
    json({
      dependencies: {
        tamagui: '3.2.0',
        '@tanstack/react-form': '1.0.0',
        '@sentry/react-native': '8.0.0',
      },
    }),
  )
  write(root, `${layout}/mobile/src/api/client.ts`, 'const client = createApiClient({})\nconst api = createTuyauReactQueryClient({ client })\nconst queryClient = new QueryClient({})\n')
  write(root, 'packages/ui/package.json', json({ dependencies: { tamagui: '3.2.0' } }))
  write(root, 'packages/ui/src/index.ts', 'export const Button = 1\n')
  write(root, 'packages/api-client/src/registry/index.ts', 'export const registry = {}\n')
  write(root, 'compose.yaml', 'services:\n  mariadb:\n    image: mariadb:11\n  caddy:\n    image: caddy:2\n')
}

test('un projet conforme passe les contrôles bloquants', () => {
  const root = createProject()
  try {
    compliant(root)
    const result = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(result.summary.fail, 0, JSON.stringify(result.checks.filter((c) => c.status === 'fail'), null, 2))
    assert.equal(result.checks.find((c) => c.id === 'stack.layout').status, 'pass')
    assert.equal(result.checks.find((c) => c.id === 'forms.mobile').status, 'pass')
    assert.equal(result.checks.find((c) => c.id === 'api.transport').status, 'pass')
    assert.equal(result.checks.find((c) => c.id === 'api.facade').status, 'pass')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('un layout packages/* échoue, puis devient une exception documentée', () => {
  const root = createProject()
  try {
    compliant(root, 'packages')
    const failed = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(failed.checks.find((c) => c.id === 'stack.layout').status, 'fail')

    write(root, '.doctrine-exceptions.json', json({ 'hb.stack-layout': { reason: 'DEC-476', date: '2026-11-07' } }))
    const accepted = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(accepted.checks.find((c) => c.id === 'stack.layout').status, 'exception')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('une queue database échoue, puis devient une exception', () => {
  const root = createProject()
  try {
    compliant(root)
    write(root, 'apps/api/config/queue.ts', 'import { drivers } from "@adonisjs/queue"\nexport default { connections: { database: drivers.database({}) } }\n')
    const failed = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(failed.checks.find((c) => c.id === 'stack.queue').status, 'fail')

    write(root, '.doctrine-exceptions.json', json({ 'hb.stack-redis-queue': 'S0 database queue' }))
    const accepted = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(accepted.checks.find((c) => c.id === 'stack.queue').status, 'exception')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('les tests ne comptent pas comme transports ou caches', () => {
  const root = createProject()
  try {
    compliant(root)
    write(
      root,
      'apps/mobile/src/api/client.test.ts',
      'const client = createApiClient({})\nconst queryClient = new QueryClient({})\n',
    )
    const result = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(result.checks.find((c) => c.id === 'api.transport').status, 'pass')
    assert.equal(result.checks.find((c) => c.id === 'api.facade').status, 'pass')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('deux transports échouent, plusieurs façades avertissent', () => {
  const root = createProject()
  try {
    compliant(root)
    write(root, 'apps/mobile/src/auth/client.ts', 'const second = createApiClient({})\n')
    const result = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(result.checks.find((c) => c.id === 'api.transport').status, 'fail')

    rmSync(join(root, 'apps/mobile/src/auth/client.ts'))
    write(root, 'apps/mobile/src/features/projects.ts', 'const facade = createTuyauReactQueryClient({ client })\n')
    const facades = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(facades.checks.find((c) => c.id === 'api.facade').status, 'warn')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('une bibliothèque UI interdite échoue', () => {
  const root = createProject()
  try {
    compliant(root)
    write(root, 'apps/web/package.json', json({ dependencies: { tamagui: '3.2.0', '@mantine/core': '9.0.0' } }))
    const result = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(result.checks.find((c) => c.id === 'ui.tamagui').status, 'fail')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('un logger sans redact échoue', () => {
  const root = createProject()
  try {
    compliant(root)
    write(root, 'apps/api/config/logger.ts', 'export default {}\n')
    const result = runDoctor({ root, profile: 'web-mobile' })
    assert.equal(result.checks.find((c) => c.id === 'ops.logs').status, 'fail')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('le rapport markdown est lisible', () => {
  const root = createProject()
  try {
    compliant(root)
    const markdown = formatDoctorMarkdown(runDoctor({ root, profile: 'web-mobile' }))
    assert.match(markdown, /# Doctrine doctor/)
    assert.match(markdown, /Conformes/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
