# Deux instances Tamagui dans le même arbre

- Date : 2026-11-07
- Catégorie : interfaces
- Source : retour d’expérience

## Erreur

Une app importe `Button` depuis `tamagui` alors que `@scope/ui` fournit déjà les primitives. Deux copies de Tamagui coexistent, avec deux contextes de thème. Les couleurs, les tokens et les animations deviennent incohérents, et les erreurs sont difficiles à relier à leur cause.

## Correction

- Importer uniquement depuis `@scope/ui`.
- Garder `tamagui` comme dépendance de `packages/ui`.
- Vérifier que `react`, `react-dom` et `react-native-web` sont dédupliqués dans Vite.
- Vérifier `process.env.TAMAGUI_TARGET = 'web'` côté web.

## Règle

`hb.stack-tamagui`, `hb.ui-imports` : une seule instance Tamagui, imports via `@scope/ui`.

## Vérification

- `rg "from 'tamagui'" apps/` ne retourne rien.
- Un test de rendu du provider passe sur web et natif.
- Le thème est identique dans les deux apps.
