# Mobile — Expo et React Native

## Expo

L'application mobile est native, avec Expo et React Native, routée par `expo-router`.

```text
apps/mobile/
├── app/
│   ├── _layout.tsx           providers : QueryClient, Tamagui, Sentry, auth
│   ├── (auth)/
│   └── (app)/
│       ├── _layout.tsx
│       └── projects/
│           ├── index.tsx
│           └── [id].tsx
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── auth/
│   ├── features/
│   └── components/
├── app.config.ts
└── metro.config.js
```

Interdits : WebView embarquée, Capacitor, Cordova, Ionic, Tauri Mobile, Flutter, React Native sans Expo.

## API client

Trois niveaux distincts :

| Niveau | Rôle | Règle |
| --- | --- | --- |
| Transport | `createApiClient` ou `createTuyau` | un seul (`hb.api-client-single`) |
| Cache | `QueryClient` | un seul, à la racine (`hb.api-client-single`) |
| Façade | `createTuyauReactQueryClient` | une seule, partagée (`ed.api-facade-single`) |

```ts
// apps/mobile/src/api/client.ts
import { createTuyau } from '@tuyau/core/client'
import { createTuyauReactQueryClient } from '@tuyau/react-query'
import { QueryClient } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'
import { registry } from '@scope/api-client/registry'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
})

export const api = createTuyauReactQueryClient({
  client: createTuyau({
    baseUrl: process.env.EXPO_PUBLIC_API_URL!,
    registry,
    hooks: {
      beforeRequest: async (request) => {
        const token = await SecureStore.getItemAsync('auth.token')
        if (token) request.headers.set('Authorization', `Bearer ${token}`)
      },
    },
  }),
  queryClient,
})
```

- Le token est injecté dans `beforeRequest`.
- Un 401 déclenche la déconnexion et le nettoyage du cache.
- Les features consomment `api` et `queryClient` via un hook `useApi(client)` ou un contexte.
- Une façade par feature est une duplication à corriger (`ed.api-facade-single`), pas une violation du hard blocker.
- Pas de `fetch` ou `axios` pour les endpoints typés.

## Keyboard

`react-native-keyboard-controller` pour les écrans de formulaire :

```tsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

<KeyboardAwareScrollView bottomOffset={20}>
  <ProjectForm />
</KeyboardAwareScrollView>
```

- Insets Android edge-to-edge.
- Éviter les `KeyboardAvoidingView` ad hoc.
- Vérifier sur un appareil réel, pas seulement l'émulateur.

## Overlays

Tamagui `Sheet` et `Dialog` via `@scope/ui`.

```tsx
import { Sheet, Button, Text } from '@scope/ui'

<Sheet open={open} onOpenChange={setOpen}>
  <Sheet.Content>
    <Text>Confirmer la suppression ?</Text>
    <Button onPress={confirm}>Supprimer</Button>
  </Sheet.Content>
</Sheet>
```

`@gorhom/bottom-sheet` uniquement pour des points d'ancrage ou des gestes complexes que Tamagui ne couvre pas.

## Dates

`Intl.DateTimeFormat` avec cache :

```ts
const formatters = new Map<string, Intl.DateTimeFormat>()

export function formatDate(locale: string, options: Intl.DateTimeFormatOptions, value: Date) {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatters.set(key, formatter)
  }
  return formatter.format(value)
}
```

`date-fns` seulement quand l'arithmétique de dates apparaît dans au moins deux fonctionnalités. Luxon reste côté serveur.

## Auth

Voir [auth.md](auth.md#mobile). Le token vit dans `expo-secure-store`, jamais dans AsyncStorage. Prévoir inactivité, révocation et mode partagé.

## Navigation

- `expo-router` uniquement.
- deep links déclarés dans `app.config.ts` ;
- écrans d'auth séparés du groupe applicatif ;
- retour arrière cohérent ;
- pas de navigation impérative dispersée.

## Build

- `expo-dev-client` pour le développement ;
- builds release par canal (interne, TestFlight, Play) ;
- variables `EXPO_PUBLIC_*` pour l'URL d'API ;
- Sentry initialisé au plus tôt ;
- vérifier les permissions caméra, photos, localisation et notifications ;
- tester sur Android 7+ et iOS 16.4+ si ces planchers sont retenus.
