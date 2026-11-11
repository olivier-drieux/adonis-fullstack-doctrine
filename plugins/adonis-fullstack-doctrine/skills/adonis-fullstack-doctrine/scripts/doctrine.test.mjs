import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildIndex,
  formatMarkdown,
  listReferences,
  loadManifest,
  readReference,
  resolveDoctrine,
  validateManifest,
} from './lib.mjs'

const manifest = loadManifest()

test('le manifeste est valide', () => {
  assert.deepEqual(validateManifest(manifest), [])
})

test('les identifiants sont uniques et préfixés par leur niveau', () => {
  const ids = new Set()
  for (const rule of manifest.rules) {
    assert.equal(ids.has(rule.id), false, `id dupliqué : ${rule.id}`)
    ids.add(rule.id)
    const prefix = { hard_blocker: 'hb.', enforced_default: 'ed.', advisory: 'adv.' }[rule.level]
    assert.ok(rule.id.startsWith(prefix), `${rule.id} doit commencer par ${prefix}`)
  }
})

test('le profil web sélectionne les règles web et exclut le mobile', () => {
  const result = resolveDoctrine({
    profile: 'web',
    surface: 'web',
    slices: ['setup', 'tamagui-component', 'form-web', 'testing'],
  })
  assert.equal(result.mode, 'typed')
  const ids = new Set(result.rules.map((rule) => rule.id))
  assert.ok(ids.has('hb.forms-web-inertia'))
  assert.ok(ids.has('hb.forms-server-validation'))
  assert.ok(ids.has('hb.stack-tamagui'))
  assert.ok(ids.has('hb.testing-tiered'))
  assert.ok(ids.has('ed.feature-order'))
  assert.equal(ids.has('hb.forms-mobile-tanstack'), false)
  assert.equal(ids.has('hb.mobile-lists'), false)
})

test('le profil web-mobile sélectionne les règles natives', () => {
  const result = resolveDoctrine({
    profile: 'web-mobile',
    surface: 'mobile',
    slices: ['form-mobile', 'list', 'image', 'auth-mobile', 'api-endpoint'],
  })
  const ids = new Set(result.rules.map((rule) => rule.id))
  assert.ok(ids.has('hb.forms-mobile-tanstack'))
  assert.ok(ids.has('ed.mobile-lists'))
  assert.ok(ids.has('ed.mobile-images'))
  assert.ok(ids.has('ed.mobile-keyboard'))
  assert.ok(ids.has('hb.auth-mobile'))
  assert.ok(ids.has('hb.api-client-single'))
  assert.ok(ids.has('hb.stack-tamagui-native'))
})

test('le profil api-only exclut Inertia et Tamagui', () => {
  const result = resolveDoctrine({
    profile: 'api-only',
    surface: 'api.external',
    slices: ['api-endpoint', 'queue-job'],
  })
  const ids = new Set(result.rules.map((rule) => rule.id))
  assert.ok(ids.has('hb.api-surfaces'))
  assert.ok(ids.has('ed.api-error-contract'))
  assert.ok(ids.has('hb.queue-idempotency'))
  assert.equal(ids.has('hb.stack-web-build'), false)
  assert.equal(ids.has('hb.stack-tamagui'), false)
  assert.equal(ids.has('hb.forms-web-inertia'), false)
})

test('une tranche inconnue bascule en mode conservateur', () => {
  const result = resolveDoctrine({
    profile: 'web',
    surface: 'web',
    slices: ['unknown-slice'],
  })
  assert.equal(result.mode, 'conservative')
  assert.deepEqual(result.unknown_slices, ['unknown-slice'])
  const ids = new Set(result.rules.map((rule) => rule.id))
  assert.ok(ids.has('hb.stack-adonisjs'))
  assert.ok(ids.has('hb.stack-web-build'))
  assert.ok(ids.has('hb.forms-web-inertia'))
})

test('le format markdown reste lisible', () => {
  const result = resolveDoctrine({ profile: 'web', surface: 'web', slices: ['setup'] })
  const markdown = formatMarkdown(result)
  assert.match(markdown, /# Résolution de doctrine/)
  assert.match(markdown, /hard_blocker/)
  assert.match(markdown, /setup.md#runtime/)
})

test('la lecture d’une référence isole le titre demandé', () => {
  const runtime = readReference('setup.md#runtime')
  assert.match(runtime, /^## Runtime/m)
  assert.doesNotMatch(runtime, /^## Baseline/m)
})

test('la lecture refuse un chemin hors des références', () => {
  assert.throws(() => readReference('../package.json'), /chemin invalide/)
})

test('la liste des références contient les fichiers attendus', () => {
  const references = listReferences()
  assert.ok(references.includes('setup.md'))
  assert.ok(references.includes('monorepo.md'))
  assert.ok(references.includes('patterns/doctrine-learning.md'))
})

test('l’index compact ne contient ni règle complète ni rationale', () => {
  const index = buildIndex(manifest)
  assert.equal(index.rules.length, manifest.rules.length)
  for (const rule of index.rules) {
    assert.equal('rule' in rule, false)
    assert.equal('rationale' in rule, false)
  }
})
