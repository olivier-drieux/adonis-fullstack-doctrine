#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = resolve(SKILL_ROOT, '..', '..', '..', '..')
const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', '.expo', 'coverage'])

function walk(directory, files = []) {
  if (!existsSync(directory)) return files
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) walk(absolute, files)
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolute)
  }
  return files
}

const broken = []
for (const file of walk(REPO_ROOT)) {
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = match[1].replace(/^<|>$/g, '')
      if (/^(?:https?:|mailto:|tel:|#)/.test(target)) continue
      const [path] = target.split('#', 1)
      if (!path) continue
      const absolute = resolve(dirname(file), path)
      if (!existsSync(absolute)) {
        broken.push({
          file: relative(REPO_ROOT, file),
          line: index + 1,
          target,
        })
      }
    }
  })
}

if (broken.length > 0) {
  console.error(`Liens locaux cassés : ${broken.length}`)
  for (const item of broken) {
    console.error(`- ${item.file}:${item.line} → ${item.target}`)
  }
  process.exit(1)
}

console.log(`Liens locaux valides (${walk(REPO_ROOT).length} fichiers Markdown).`)
