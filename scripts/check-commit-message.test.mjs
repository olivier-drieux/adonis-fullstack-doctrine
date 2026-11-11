import assert from 'node:assert/strict'
import test from 'node:test'
import { checkCommitMessage } from './check-commit-message.mjs'

test('accepte un sujet conventionnel en anglais', () => {
  assert.equal(checkCommitMessage('fix(doctor): ignore test fixtures\n'), null)
  assert.equal(checkCommitMessage('feat: add the commit-msg hook'), null)
  assert.equal(checkCommitMessage('docs!: drop the legacy guide'), null)
})

test('refuse un type inconnu ou un sujet libre', () => {
  assert.match(checkCommitMessage('update stuff'), /Conventional Commits/)
  assert.match(checkCommitMessage('feature: add hooks'), /Conventional Commits/)
})

test('refuse un scope invalide ou une description vide', () => {
  assert.match(checkCommitMessage('fix(Doctor): add hooks'), /Conventional Commits/)
  assert.match(checkCommitMessage('fix(doctor): '), /Conventional Commits/)
})

test('refuse un message vide', () => {
  assert.match(checkCommitMessage('\n\n'), /vide/)
})

test('accepte les commits générés par Git', () => {
  assert.equal(checkCommitMessage('Merge branch "main"\n'), null)
  assert.equal(checkCommitMessage('Revert "feat: add x"\n'), null)
  assert.equal(checkCommitMessage('fixup! feat: add x\n'), null)
})
