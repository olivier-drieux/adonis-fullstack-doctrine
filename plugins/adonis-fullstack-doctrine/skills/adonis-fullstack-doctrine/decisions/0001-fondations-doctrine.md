# 0001 — Fondations de la doctrine

- Date : 2026-11-07
- Source : cadrage initial
- Statut : acceptée

## Contexte

Une doctrine exécutable doit fixer trois choses à la fois : la stack, le layout du monorepo et la boucle d'apprentissage. Une documentation statique ne suffit pas : chaque règle doit être sélectionnable et vérifiable.

Le web et le mobile partagent l'interface. Le déploiement reste unique. Les formulaires, l'authentification et les files de travail suivent les primitives du framework.

## Décision

Créer le dépôt `adonis-fullstack-doctrine` avec un moteur autonome :

- manifeste typé et resolver déterministe ;
- références lues à la demande ;
- doctor et tests de contrat ;
- décisions, leçons et évaluation.

La stack retenue est AdonisJS 7, Inertia 3, React 19 et Tamagui, avec Expo/React Native optionnel. Le workspace utilise pnpm et le layout `apps/` + `packages/`.

Le moteur est écrit de zéro, sans dépendance externe.

## Conséquences

- La doctrine est autonome : elle ne dépend d'aucun autre dépôt.
- Mantine, Gluestack, NativeWind et l'UI non partagée sont hors périmètre.
- La sécurité et la méthode sont verrouillées par des règles testées.
- Les profils `web`, `web-mobile` et `api-only` couvrent les cas d'usage.
