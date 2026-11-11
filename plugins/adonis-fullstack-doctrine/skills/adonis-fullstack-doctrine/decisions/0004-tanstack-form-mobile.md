# 0004 — TanStack Form pour le mobile

- Date : 2026-11-07
- Source : arbitrage utilisateur
- Statut : acceptée

## Contexte

Sans bibliothèque de formulaire, chaque écran gère `useState`, `errors`, `busy` et `operationId`. Un formulaire complexe atteint vite 1 500 lignes.

React Hook Form était une option pour sa maturité. TanStack Form a été retenu.

## Décision

- Mobile : TanStack Form via l'adaptateur `@scope/ui/form`.
- Web : Inertia `<Form>` pour les parcours standards, `useForm` pour les cas complexes.
- Validation : VineJS serveur, seule source. Aucun schéma Zod/Yup côté client.

## Conséquences

- Les écrans n'importent pas TanStack Form directement.
- Les erreurs serveur sont injectées dans les field meta.
- Les validateurs client qui dupliquent VineJS sont interdits.
- Un adaptateur unique garde une API stable même si TanStack Form évolue.
- L'adoption se fait écran par écran, sans réécriture globale.
