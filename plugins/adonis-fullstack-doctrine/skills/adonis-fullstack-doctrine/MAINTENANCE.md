# Maintenance

## Versioning

Semver par plugin :

- **MAJOR** : règle retirée, sémantique inversée, id renommé ;
- **MINOR** : règle ajoutée, exception documentée, référence ajoutée ;
- **PATCH** : correction de texte, lien cassé, clarification sans changement de contrat.

Toute modification du plugin met à jour :

1. `plugins/adonis-fullstack-doctrine/.claude-plugin/plugin.json` ;
2. `plugins/adonis-fullstack-doctrine/.codex-plugin/plugin.json` ;
3. `plugins/adonis-fullstack-doctrine/CHANGELOG.md` ;
4. `CHANGELOG.md` racine.

Dans le même commit.

## Index

Après toute modification de `rules/manifest.json` :

```bash
pnpm doctrine:write
pnpm doctrine:check
pnpm doctrine:test
```

L'index `manifest-index.json` est généré, jamais édité à la main.

## Références

- Une règle pointe vers un fichier et un titre existants.
- Un titre renommé casse la validation : mettre à jour le sélecteur dans le même commit.
- Une référence ne doit pas dépasser ce qu'un agent peut charger utilement ; préférer un sous-titre à un fichier entier.

## Veille

Trimestriellement :

- vérifier les versions AdonisJS, Inertia, Tamagui, Expo, React, Vite ;
- vérifier les peer ranges avant de changer la baseline ;
- relire les décisions devenues obsolètes ;
- archiver une décision plutôt que la supprimer ;
- vérifier que les leçons sont encore vraies.

## Dépréciation

- Une règle dépréciée reste dans le manifeste avec `level: advisory` et une note de migration.
- Un id n'est jamais réutilisé.
- Une décision peut être remplacée par une nouvelle, avec un lien `Remplace` / `Remplacée par`.

## Apprentissage

Chaque correction doctrinale suit `references/patterns/doctrine-learning.md`. Une PR sans preuve n'est pas mergeable.
