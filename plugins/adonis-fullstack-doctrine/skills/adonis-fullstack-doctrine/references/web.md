# Web — React, Inertia et Tamagui

## Build

`apps/web` est une application Vite indépendante. Elle construit vers `apps/api/public/assets`, servie par l'API AdonisJS. Un seul déploiement.

```ts
// apps/web/vite.config.ts
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

`apps/api/vite.config.mjs` réexporte cette configuration. Le serveur garde la main sur le cycle de vie ; le web garde la main sur le frontend.

## Entry point

```tsx
// apps/web/src/app.tsx
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@scope/ui'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
    return pages[`./pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AppProvider>
        <App {...props} />
      </AppProvider>,
    )
  },
})
```

## Page typing

Typer les props avec `InertiaProps` et les données transformées avec `Data.*` :

```tsx
import type { InertiaProps } from '~/types'
import type { Data } from '@generated/data'

type Props = InertiaProps<{
  project: Data.Project
  canEdit: boolean
}>

export default function ProjectShow({ project, canEdit }: Props) {
  return <ProjectView project={project} canEdit={canEdit} />
}
```

Ne jamais redéclarer une interface pour un transformer. Le type généré est le contrat.

## Data loading

Une page Inertia possède ses données. Utiliser :

- les props serveur ;
- les reloads partiels (`only`, `except`) ;
- `defer` pour les blocs lents ;
- `usePoll` pour le rafraîchissement ;
- `inertia.scroll` + `InfiniteScroll` pour les listes infinies.

`useHttp` est réservé à une requête typée qui ne remplace pas la page, l'historique ou les props. Ce n'est pas un cache.

## Styling

Tamagui first :

- tokens, props et variantes ;
- `XStack`, `YStack`, `Text`, `Button`, `Field` depuis `@scope/ui` ;
- pas d'import direct de `tamagui` dans `apps/web` ;
- CSS Modules uniquement pour l'impression, un layout DOM complexe ou un composant tiers.

Interdits : Tailwind, styled-components, Emotion, CSS global non scopé.

## Navigation

Un seul routeur : Inertia. Pas de React Router, TanStack Router ou routeur maison.

Utiliser `Link` et `Form` de `@adonisjs/inertia/react`, avec `route` et `routeParams`.

## Erreurs

Le handler global rend une vraie page Inertia pour les erreurs navigateur, avec un statut non-2xx préservé. Les appels JSON reçoivent du JSON non-2xx, jamais du HTML 200. Les props d'erreur sont étroites : `status`, `code` stable, jamais de message d'exception, stack ou PII.

## Tests

- `node:test` pour la logique de présentation pure.
- Tests de parcours via le serveur AdonisJS et Japa.
- Vérifier le rendu des états vides, erreur et chargement.
