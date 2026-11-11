import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveDoctrine } from './lib.mjs'

function ids(result) {
  return new Set(result.rules.map((rule) => rule.id))
}

test('scénario 1 — nouveau projet web', () => {
  const result = resolveDoctrine({ profile: 'web', surface: 'web', slices: ['setup', 'monorepo'] })
  const selected = ids(result)
  for (const id of ['hb.stack-adonisjs', 'hb.stack-layout', 'hb.stack-web-build', 'hb.stack-tamagui', 'ed.feature-order']) {
    assert.ok(selected.has(id), `règle attendue absente : ${id}`)
  }
  assert.equal(selected.has('hb.forms-mobile-tanstack'), false)
})

test('scénario 2 — auth mobile et formulaire', () => {
  const result = resolveDoctrine({
    profile: 'web-mobile',
    surface: 'mobile',
    slices: ['auth-mobile', 'form-mobile'],
  })
  const selected = ids(result)
  for (const id of ['hb.auth-mobile', 'hb.forms-mobile-tanstack', 'ed.mobile-keyboard', 'hb.stack-tamagui-native']) {
    assert.ok(selected.has(id), `règle attendue absente : ${id}`)
  }
  assert.equal(selected.has('hb.forms-web-inertia'), false)
})

test('scénario 3 — API pure et job Redis', () => {
  const result = resolveDoctrine({
    profile: 'api-only',
    surface: 'api.external',
    slices: ['api-endpoint', 'queue-job'],
  })
  const selected = ids(result)
  for (const id of ['hb.api-surfaces', 'ed.api-error-contract', 'hb.queue-idempotency']) {
    assert.ok(selected.has(id), `règle attendue absente : ${id}`)
  }
  assert.equal(selected.has('hb.stack-tamagui'), false)
  assert.equal(selected.has('hb.stack-web-build'), false)
})

test('scénario 4 — override Mantine', () => {
  const result = resolveDoctrine({ profile: 'web', surface: 'web', slices: ['tamagui-component'] })
  assert.ok(ids(result).has('hb.stack-tamagui'))
})

test('scénario 5 — apprentissage', () => {
  const result = resolveDoctrine({
    profile: 'web-mobile',
    surface: 'cross-cutting',
    slices: ['doctrine-learning'],
  })
  const selected = ids(result)
  assert.ok(selected.has('ed.doctrine-learning'))
  assert.ok(selected.has('hb.doctrine-no-silent-change'))
})

test('transport et façade sont deux règles distinctes', () => {
  const result = resolveDoctrine({ profile: 'web-mobile', surface: 'mobile', slices: ['api-endpoint'] })
  const selected = ids(result)
  assert.ok(selected.has('hb.api-client-single'))
  assert.ok(selected.has('ed.api-facade-single'))
})
