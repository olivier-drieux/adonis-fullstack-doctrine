# Authentification

## Browser

Le web utilise `@adonisjs/auth` avec le guard `web`, session et cookie.

```ts
// config/auth.ts
import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'

export default defineConfig({
  defaultGuard: 'web',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: true,
      provider: sessionUserProvider({ model: () => import('#models/user') }),
    }),
  },
})
```

Règles :

- CSRF actif sur les surfaces `web` et `api.internal`.
- Cookie `httpOnly`, `secure` en production, `sameSite: 'lax'`.
- « Rester connecté » explicite pour les écrans sensibles.
- Durée d'inactivité configurable, pas figée dans le code.
- Le web ne consomme pas d'access tokens.

## Mobile

Le mobile utilise le guard `api` et des access tokens AdonisJS.

```ts
// config/auth.ts
import { tokensGuard, tokensUserProvider } from '@adonisjs/auth/access_tokens'

guards: {
  api: tokensGuard({
    provider: tokensUserProvider({ model: () => import('#models/user') }),
  }),
}
```

Stockage :

```ts
import * as SecureStore from 'expo-secure-store'

await SecureStore.setItemAsync('auth.token', token, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
})
```

Cycle de vie :

- expiration explicite ;
- révocation à la déconnexion et sur changement de mot de passe ;
- inactivité de 30 jours par défaut, configurable ;
- mode partagé : déconnexion à la fermeture ou après un délai court ;
- renouvellement par activité réelle, sans prolonger indéfiniment ;
- token jamais dans AsyncStorage, un log ou une URL.

## Guards

Les noms `web` et `api` sont réservés :

- `web` : session navigateur ;
- `api` : tokens externes.

Des guards supplémentaires sont autorisés pour des populations disjointes (admin, client, commercial), avec provider et cookie propres. Jamais un `userProvider` polymorphe.

## Public tokens

Deux sous-chemins seulement.

### Action ponctuelle

URL signée AdonisJS :

```ts
const url = router.makeSignedUrl('download', { id }, { expiresIn: '30m' })
```

Vérifier avec `request.hasValidSignature()`. Pas de table de tokens, pas de JWT maison, pas de HMAC manuel.

### Lien persistant

Un modèle Lucid dédié :

- token `crypto.randomBytes(32).toString('base64url')` ;
- préfixe typé (`share_`, `inv_`, `portal_`) ;
- hash SHA-256 en base, token en clair retourné une seule fois ;
- FK non nulle vers la ressource ;
- `expires_at` non nul ;
- révocation par suppression ou `revoked_at` ;
- `last_used_at` ;
- rate-limit `@adonisjs/limiter` sur `${hash}:${ip}`.

Un token public est un bearer credential, pas une preuve de possession d'appareil. Un changement d'appareil échoue et déclenche une récupération, jamais un rebinding silencieux.

## Tests

- session absente, expirée, révoquée ;
- token invalide, expiré, révoqué ;
- CSRF absent et valide ;
- lien public expiré, révoqué, réutilisé ;
- mode partagé ;
- changement de mot de passe.
