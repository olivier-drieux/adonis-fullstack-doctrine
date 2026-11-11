#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const TYPES = 'build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test'
const SUBJECT = new RegExp(`^(?:${TYPES})(?:\\([a-z0-9][a-z0-9._/-]*\\))?!?: [a-z0-9][^\\n]*$`)
const GENERATED = /^(?:Merge |Revert "|fixup! |squash! )/

export function checkCommitMessage(message) {
  const subject = message.split('\n', 1)[0].trim()
  if (subject === '') return 'le message de commit est vide'
  if (GENERATED.test(subject)) return null
  if (!SUBJECT.test(subject)) {
    return 'le sujet doit suivre Conventional Commits en anglais, par exemple « fix(doctor): ignore test fixtures »'
  }
  return null
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2]
  if (!file) {
    console.error('commit-msg: chemin du fichier de message manquant')
    process.exit(2)
  }
  const error = checkCommitMessage(readFileSync(file, 'utf8'))
  if (error) {
    console.error(`commit-msg: ${error}`)
    process.exit(1)
  }
}
