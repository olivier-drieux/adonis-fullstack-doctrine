# Setup

## Runtime

La stack cible est **AdonisJS 7** avec Node.js 24, pnpm 12, TypeScript 6, Vite 8, React 19 et Inertia 3.

Avant d'installer quoi que ce soit :

1. vérifier `packages.adonisjs.com` pour un paquet officiel ;
2. vérifier `npmjs.com` pour un paquet maintenu si aucun paquet officiel n'existe ;
3. préférer une primitive AdonisJS à une composition maison.

```bash
node --version   # >= 24
pnpm --version   # 12.x
```

## Baseline

La combinaison vérifiée est :

| Paquet | Baseline |
| --- | --- |
| `@adonisjs/core` | 7.x |
| `@adonisjs/inertia` | 5.x |
| `@inertiajs/core` / `@inertiajs/react` | 3.x |
| `@adonisjs/vite` | 6.x |
| Vite | 8.x |
| React / React DOM | 19.x |
| TypeScript | >= 6.0 |
| Tamagui | 3.x |
| Expo / React Native | Expo SDK compatible avec la cible mobile |

Ne jamais forcer un graphe incohérent avec `--force` ou `--legacy-peer-deps`. Si un peer range ne se résout pas, arrêter et documenter le conflit.

## Create the workspace

```bash
mkdir my-app && cd my-app
git init -b main
pnpm init
```

Créer `apps/api`, `apps/web`, puis `apps/mobile` si le profil est `web-mobile`.

## Create apps/api

```bash
pnpm create adonisjs@latest apps/api -- --kit=api
```

Ajouter ensuite les paquets du profil :

```bash
pnpm --filter api add @adonisjs/inertia @adonisjs/vite @adonisjs/session @adonisjs/shield @adonisjs/auth @adonisjs/lucid @adonisjs/queue @adonisjs/bouncer @adonisjs/mail @adonisjs/drive @tuyau/core
```

Configurer `adonisrc.ts` avec les preloads de routes par surface et le hook `@adonisjs/vite/build_hook`.

## Create apps/web

```bash
pnpm create vite@latest apps/web -- --template react-ts
pnpm --filter web add @inertiajs/react react react-dom @scope/ui @scope/api-client @scope/shared-types
pnpm --filter web add -D @adonisjs/vite @vitejs/plugin-react vite typescript
```

`apps/web/vite.config.ts` construit vers `apps/api/public/assets` et utilise `@adonisjs/vite/client` :

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    react(),
    adonisjs({
      entryPoints: ['src/app.tsx'],
      buildDirectory: resolve(import.meta.dirname, '../api/public/assets'),
      reload: [resolve(import.meta.dirname, '../api/resources/views/**/*.edge')],
    }),
  ],
  resolve: {
    alias: [{ find: '~/', replacement: `${import.meta.dirname}/src/` }],
    dedupe: ['react', 'react-dom', 'react-native-web'],
  },
  define: {
    'process.env.TAMAGUI_TARGET': JSON.stringify('web'),
  },
})
```

`apps/api/vite.config.mjs` ne fait que réexporter la configuration web :

```js
export { default } from '@scope/web/vite'
```

## Create apps/mobile

```bash
pnpm create expo-app@latest apps/mobile --template blank-typescript
```

Ajouter Expo Router, Tamagui natif, TanStack Query, TanStack Form, Tuyau, SecureStore, FlashList, expo-image et keyboard-controller.

Le détail est dans [mobile.md](mobile.md).

## First checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm verify
```

## Comments

Commenter le **pourquoi**, jamais le **quoi**. Une ligne suffit pour une intention non évidente, un contournement, un invariant ou un piège framework. Pas de narration de contrôle de flux, pas de code commenté, pas de JSDoc qui répète la signature.

## Primitives

Avant d'écrire un helper, vérifier :

- service AdonisJS ;
- middleware ;
- validateur VineJS ;
- policy Bouncer ;
- mail, drive, queue ;
- helper de route et `urlFor` ;
- composant Tamagui.

## Verify

Lire les types exportés ou la source d'un paquet avant de l'utiliser pour la première fois. Ne pas se fier à la mémoire d'une version majeure. En cas de doute, ouvrir le `.d.ts` installé.
