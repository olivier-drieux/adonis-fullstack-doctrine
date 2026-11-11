# Règles de contribution — adonis-fullstack-doctrine

Ce dépôt contient une doctrine exécutable pour les projets AdonisJS 7 + Inertia/Tamagui, avec mobile Expo optionnel.

## Avant de modifier

1. Lire `plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/SKILL.md`.
2. Chercher une règle, une décision ou une leçon existante avant d'en ajouter une.
3. Vérifier que la modification ne contredit pas un `hard_blocker` sans décision explicite.

## Règles de modification

- Toute règle ajoutée, retirée ou modifiée doit avoir une entrée dans `decisions/` ou `lessons/` et une référence dans `rules/manifest.json`.
- Toute modification du manifeste exige `pnpm doctrine:write` puis `pnpm doctrine:check`.
- Toute modification de comportement exige `pnpm doctrine:test`.
- Le gate complet est `pnpm check` : tests, index, liens, versions et templates.
- `pnpm hooks:install` configure le pre-push local.
- Toute modification du plugin exige une montée de version dans `plugins/adonis-fullstack-doctrine/.claude-plugin/plugin.json` et `.codex-plugin/plugin.json`, une entrée dans le `CHANGELOG.md` du plugin et dans le `CHANGELOG.md` racine, dans le même commit.
- Ne jamais renommer un identifiant de règle sans décision majeure : les projets peuvent le citer.
- Ne jamais ajouter un secret, une donnée personnelle réelle ou un exemple de production.

## Apprentissage

Une correction utilisateur qui change une règle ou révèle une erreur répétée doit être consignée :

1. leçon dans `lessons/<catégorie>/<slug>.md` pour une erreur d'application ;
2. décision dans `decisions/NNNN-<slug>.md` pour un choix structurant ;
3. règle dans `rules/manifest.json` si la correction doit être bloquante ;
4. preuve dans `doctrine.test.mjs` ou dans un scénario d'`EVALUATION.md`.

La procédure complète est dans `commands/doctrine-learn.md` et `references/patterns/doctrine-learning.md`.

## Git

- Un commit par résultat cohérent. Sujet en anglais, format Conventional Commits : `type(scope): description`.
- Types autorisés : `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`. Le hook `commit-msg` vérifie le format.
- Branche `doctrine/<slug>` pour une entrée d'apprentissage, puis PR.
- `git diff --cached --check` avant commit.
- Ne pas réécrire l'historique publié.
