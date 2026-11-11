# Monorepo

## Workspace

Le dépôt est toujours un monorepo pnpm. Un seul lockfile, un seul `node_modules` aplati.

`pnpm-workspace.yaml` :

```yaml
packages:
  - apps/*
  - packages/*

strictPeerDependencies: true
autoInstallPeers: false
nodeLinker: hoisted
verifyDepsBeforeRun: error
saveExact: true
```

Pourquoi :

- **hoisted** : Metro et Expo résolvent mal les liens symboliques de pnpm sans `nodeLinker: hoisted`.
- **strictPeerDependencies** : un peer incompatible casse à l'installation, pas en production.
- **saveExact** : les versions sont épinglées ; une mise à jour est un acte explicite.
- **verifyDepsBeforeRun** : un lockfile périmé bloque l'exécution.

Chaque workspace déclare ses dépendances directes. Un import ne doit jamais dépendre d'un paquet hoisté depuis un voisin.

## Layout

```text
my-app/
├── apps/
│   ├── api/                  AdonisJS 7
│   │   ├── app/
│   │   ├── config/
│   │   ├── database/
│   │   ├── start/routes/     un fichier par surface
│   │   └── tests/
│   ├── web/                  React 19 + Inertia 3 + Vite 8
│   │   ├── src/
│   │   └── vite.config.ts
│   └── mobile/               Expo + React Native (optionnel)
│       ├── app/              expo-router
│       └── src/
├── packages/
│   ├── ui/                   Tamagui, primitives et composants partagés
│   ├── shared-types/         DTO purs, aucun runtime
│   └── api-client/           registre Tuyau généré
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

Règles :

- `apps/` contient ce qui se déploie.
- `packages/` contient ce qui se partage.
- `packages/shared-types` n'importe ni AdonisJS, ni Expo, ni Tamagui.
- `packages/api-client` est généré, jamais édité à la main.
- `packages/ui` ne contient pas de logique métier.

## Root package.json

```json
{
  "private": true,
  "packageManager": "pnpm@12.9.1",
  "engines": { "node": ">=24", "pnpm": "12.9.1" },
  "scripts": {
    "dev": "pnpm --filter api dev",
    "dev:web": "pnpm --filter web dev",
    "dev:mobile": "pnpm --filter mobile start",
    "build": "pnpm --filter web build && pnpm --filter api build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "verify": "node scripts/verify.mjs"
  }
}
```

## TypeScript

- `packages/shared-types` compile vers `dist` pour le natif et expose les types source pour le web.
- `packages/api-client` expose les types source et le registre généré.
- `packages/ui` expose `types`, `react-native` et `default` dans ses `exports`.
- Les apps étendent la configuration AdonisJS ou Expo, sans dupliquer les chemins.

## Metro

`apps/mobile/metro.config.js` doit voir le workspace root :

```js
const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

module.exports = config
```

## Interdits

- Turborepo ou Nx par défaut.
- Un second lockfile.
- Un `package.json` racine qui déclare les dépendances des apps.
- Un import croisé entre `apps/web` et `apps/mobile`.
- Un package `shared` fourre-tout.
