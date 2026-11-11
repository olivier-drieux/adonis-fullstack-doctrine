# 0010 — Commits en anglais, Conventional Commits

- Date : 2026-11-09
- Source : arbitrage utilisateur
- Statut : acceptée

## Contexte

`AGENTS.md` demandait un message de commit descriptif en français. Aucun contrôle ne vérifiait ce point. L'historique mélangeait des messages libres et des préfixes conventionnels.

Un message en anglais aligne le dépôt sur les conventions des outils et des contributeurs externes. Un préfixe typé rend l'historique filtrable et permet une vérification automatique.

## Décision

- Le sujet du commit suit Conventional Commits : `type(scope): description`.
- Types autorisés : `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.
- La description est en anglais, à l'impératif, en minuscule.
- Le corps reste optionnel. Il est en anglais.
- Le hook `commit-msg` vérifie le format. Les commits de fusion et les annulations générés par Git restent acceptés.
- `AGENTS.md` porte la règle.

## Conséquences

- Les commits existants en français ne sont pas réécrits.
- Un message non conforme est rejeté avant l'enregistrement.
- Le hook s'installe avec `pnpm hooks:install`.

## Vérification

- `scripts/check-commit-message.test.mjs` couvre les sujets valides, les types inconnus, le scope, le point d'exclamation et le message vide.
- `pnpm check` exécute ce test.
