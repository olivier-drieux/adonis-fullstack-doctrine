# Tamagui

## Single instance

`packages/ui` est le **seul** endroit qui dépend de Tamagui. Les applications consomment `@scope/ui`.

```json
// packages/ui/package.json
{
  "name": "@scope/ui",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "react-native": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "dependencies": {
    "@tamagui/core": "3.x",
    "@tamagui/native": "3.x",
    "tamagui": "3.x"
  },
  "peerDependencies": {
    "react": ">=19",
    "react-dom": ">=19",
    "react-native": ">=0.81"
  }
}
```

Deux copies de Tamagui dans le même arbre produisent des contextes de thème séparés et des erreurs difficiles à diagnostiquer.

## Imports

```ts
// apps/web/src/pages/projects/index.tsx
import { Button, Text, XStack, YStack } from '@scope/ui' // correct
// import { Button } from 'tamagui'                     // interdit
```

Les apps n'importent pas `tamagui`, `@tamagui/core` ou `@tamagui/native` directement. Cette règle garde une seule instance et permet de changer les primitives sans toucher aux écrans.

## Boundary

`packages/ui` contient :

- primitives : `Button`, `Input`, `Field`, `Label`, `Text`, `Sheet`, `Dialog`, `Avatar`, `EmptyState`, `Spinner` ;
- composants partagés **feature-agnostic** : `AppShell`, `SectionHeader`, `ConfirmDialog` ;
- provider, thème, tokens, motion.

Il ne contient pas :

- d'appel API ;
- de règle métier ;
- de type propre à un domaine (chantier, facture, devis) ;
- de navigation propre à une app.

Un composant métier partagé entre web et natif vit dans l'app ou dans un package de feature dédié, pas dans `ui`.

## Theme

La doctrine fournit le **mécanisme**, pas les valeurs.

```tsx
// packages/ui/src/theme.tsx
export interface ThemeTokens {
  color: Record<string, string>
  space: Record<string, number>
  radius: Record<string, number>
  font: Record<string, string>
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <Theme name="light">{children}</Theme>
    </TamaguiProvider>
  )
}
```

Chaque projet fournit sa palette, sa typographie et ses radius. Aucun orange, aucune police, aucun ton ne sont imposés.

## Native

- `@tamagui/native` côté mobile ;
- `@tamagui/animations-motion` côté web ;
- `@tamagui/animations-react-native` côté natif ;
- fichiers `.web.tsx` / `.native.tsx` pour les variantes.

```tsx
// packages/ui/src/sheet.tsx
export { Sheet } from './sheet.web'
```

```tsx
// packages/ui/src/sheet.native.tsx
export { Sheet } from 'tamagui'
```

## Variants

```tsx
import { styled, GetProps } from 'tamagui'

export const Card = styled(YStack, {
  backgroundColor: '$background',
  borderRadius: '$4',
  padding: '$4',
  variants: {
    tone: {
      neutral: { backgroundColor: '$background' },
      accent: { backgroundColor: '$accent' },
    },
  } as const,
})

export type CardProps = GetProps<typeof Card>
```

## Pitfalls

- Deux `TamaguiProvider` dans l'arbre.
- Un import direct de `tamagui` dans une app.
- Un thème défini dans `apps/web` et un autre dans `apps/mobile`.
- `react-native-web` non dédupliqué dans Vite.
- Oublier `process.env.TAMAGUI_TARGET = 'web'` dans la config Vite.
- Mélanger CSS Modules et props Tamagui sur le même composant sans raison.

## Tests

- Tester les variantes et les états (disabled, loading, error) dans `packages/ui`.
- Tester le rendu web et natif des composants qui ont une variante de plateforme.
- Ne pas tester les couleurs en snapshot : tester la structure et les états.
