#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const hooks = ['pre-push', 'commit-msg']

for (const name of hooks) {
  const hook = join(repoRoot, '.githooks', name)
  if (!existsSync(hook)) {
    console.error(`Hook ${name} introuvable.`)
    process.exit(1)
  }
  chmodSync(hook, 0o755)
}

execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
  cwd: repoRoot,
  stdio: 'inherit',
})
console.log('Hooks installés : core.hooksPath=.githooks')
console.log('Le pre-push exécute pnpm check. Le commit-msg vérifie Conventional Commits.')
