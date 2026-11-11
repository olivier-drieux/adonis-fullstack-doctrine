#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN_ROOT = resolve(SKILL_ROOT, '..', '..')
const REPO_ROOT = resolve(PLUGIN_ROOT, '..', '..')

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function firstChangelogVersion(file) {
  const match = /^##\s+(\d+\.\d+\.\d+)/m.exec(readFileSync(file, 'utf8'))
  return match?.[1] ?? null
}

function skillVersion(file) {
  const match = /metadata:\s*[\s\S]*?version:\s*["']?(\d+\.\d+\.\d+)/m.exec(readFileSync(file, 'utf8'))
  return match?.[1] ?? null
}

export function collectVersions({ repoRoot = REPO_ROOT, pluginRoot = PLUGIN_ROOT, skillRoot = SKILL_ROOT } = {}) {
  return {
    'package.json': readJson(resolve(repoRoot, 'package.json')).version,
    'plugin claude': readJson(resolve(pluginRoot, '.claude-plugin', 'plugin.json')).version,
    'plugin codex': readJson(resolve(pluginRoot, '.codex-plugin', 'plugin.json')).version,
    'changelog plugin': firstChangelogVersion(resolve(pluginRoot, 'CHANGELOG.md')),
    'changelog racine': firstChangelogVersion(resolve(repoRoot, 'CHANGELOG.md')),
    'SKILL.md': skillVersion(resolve(skillRoot, 'SKILL.md')),
    manifest: readJson(resolve(skillRoot, 'rules', 'manifest.json')).version,
  }
}

export function findVersionError(versions) {
  const values = new Set(Object.values(versions))
  if (values.size !== 1 || values.has(null)) {
    return 'Versions incohérentes : elles doivent toutes être identiques.'
  }
  return null
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const versions = collectVersions()
  for (const [name, value] of Object.entries(versions)) {
    console.log(`${name}: ${value ?? 'absente'}`)
  }
  const error = findVersionError(versions)
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log(`Versions cohérentes : ${[...new Set(Object.values(versions))][0]}`)
}
