# 0002 — Monorepo apps/ + packages/

- Date : 2026-11-07
- Source : arbitrage utilisateur
- Statut : acceptée

## Contexte

Deux layouts sont possibles :

- plat, avec une seule application : simple, mais il impose une restructuration dès que l'UI partagée ou le mobile arrive ;
- monorepo avec un seul dossier `packages/*` : permanent, mais il mélange applications et bibliothèques.

## Décision

Monorepo permanent, avec :

```text
apps/api
apps/web
apps/mobile        (optionnel)
packages/ui
packages/shared-types
packages/api-client
```

pnpm partout, `nodeLinker: hoisted`, peers stricts, versions exactes, `verifyDepsBeforeRun: error`.

## Conséquences

- Un projet web seul porte déjà `packages/ui` et `shared-types` : c'est le prix de la cohérence.
- Le mobile reste optionnel : `apps/mobile` n'existe que pour le profil `web-mobile`.
- Le web garde son propre build Vite et compile vers `apps/api/public/assets`.
- Un seul lockfile, un seul `node_modules` aplati.
- Turborepo et Nx restent hors du périmètre par défaut.
