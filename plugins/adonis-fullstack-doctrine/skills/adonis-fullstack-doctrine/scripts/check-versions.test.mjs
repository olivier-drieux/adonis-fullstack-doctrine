import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { collectVersions, findVersionError } from './check-versions.mjs'

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function makeRepo(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'doctrine-versions-'))
  const plugin = join(root, 'plugin')
  const skill = join(plugin, 'skills', 'doctrine')
  mkdirSync(join(plugin, '.claude-plugin'), { recursive: true })
  mkdirSync(join(plugin, '.codex-plugin'), { recursive: true })
  mkdirSync(join(skill, 'rules'), { recursive: true })

  const base = overrides.version ?? '1.0.0'
  writeJson(join(root, 'package.json'), { version: overrides.packageJson ?? base })
  writeJson(join(plugin, '.claude-plugin', 'plugin.json'), { version: overrides.claude ?? base })
  writeJson(join(plugin, '.codex-plugin', 'plugin.json'), { version: overrides.codex ?? base })
  writeJson(join(skill, 'rules', 'manifest.json'), { version: overrides.manifest ?? base })

  const pluginChangelog = overrides.pluginChangelog ?? base
  const rootChangelog = overrides.rootChangelog ?? base
  writeFileSync(join(plugin, 'CHANGELOG.md'), `# Changelog\n\n## ${pluginChangelog} — 2026-01-01\n`)
  writeFileSync(join(root, 'CHANGELOG.md'), `# Changelog\n\n## ${rootChangelog} — 2026-01-01\n`)
  const skillVersion = overrides.skill ?? base
  writeFileSync(
    join(skill, 'SKILL.md'),
    `---\nname: doctrine\nmetadata:\n  version: "${skillVersion}"\n---\n`,
  )

  return { repoRoot: root, pluginRoot: plugin, skillRoot: skill }
}

test('versions identiques : aucune erreur', (t) => {
  const paths = makeRepo()
  t.after(() => rmSync(paths.repoRoot, { recursive: true, force: true }))

  const versions = collectVersions(paths)
  assert.equal(findVersionError(versions), null)
  assert.deepEqual(new Set(Object.values(versions)), new Set(['1.0.0']))
})

test('une version dérivée : erreur détectée', (t) => {
  const paths = makeRepo({ manifest: '2.0.0' })
  t.after(() => rmSync(paths.repoRoot, { recursive: true, force: true }))

  const versions = collectVersions(paths)
  assert.equal(versions.manifest, '2.0.0')
  assert.match(findVersionError(versions), /Versions incohérentes/)
})

test('un changelog sans version : erreur détectée', (t) => {
  const paths = makeRepo({ rootChangelog: 'À venir' })
  t.after(() => rmSync(paths.repoRoot, { recursive: true, force: true }))

  const versions = collectVersions(paths)
  assert.equal(versions['changelog racine'], null)
  assert.match(findVersionError(versions), /Versions incohérentes/)
})
