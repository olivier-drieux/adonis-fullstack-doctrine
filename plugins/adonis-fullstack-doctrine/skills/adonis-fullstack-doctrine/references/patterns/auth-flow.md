# Pattern — Auth flow

Connexion par code temporaire, web et mobile.

## 1. Demande de code

```ts
// POST /auth/code
const payload = await request.validateUsing(requestCodeValidator)
await AuthService.requestCode(payload.email)
return response.noContent()
```

- réponse identique que l'email existe ou non ;
- rate-limit par email et par IP ;
- code à 6 chiffres, durée 10 minutes ;
- stockage hashé, jamais en clair ;
- envoi par mail, pas de code dans la réponse.

## 2. Vérification

```ts
// POST /auth/verify
const { email, code, remember } = await request.validateUsing(verifyCodeValidator)
const user = await AuthService.verifyCode(email, code)
```

### Web

```ts
await auth.use('web').login(user, remember)
return response.redirect().toRoute('dashboard')
```

- session/cookie ;
- CSRF actif ;
- remember-me explicite ;
- cookie `httpOnly`, `secure`, `sameSite=lax`.

### Mobile

```ts
const token = await auth.use('api').createToken(user, ['mobile'], {
  expiresIn: '30d',
})
return { token: token.value!.release() }
```

- token retourné une seule fois ;
- stockage `expo-secure-store` ;
- inactivité 30 jours par défaut ;
- révocation à la déconnexion ;
- mode partagé : déconnexion à la fermeture ou délai court.

## 3. Requête authentifiée

```ts
// mobile
beforeRequest: async (request) => {
  const token = await SecureStore.getItemAsync('auth.token')
  if (token) request.headers.set('Authorization', `Bearer ${token}`)
}
```

## 4. Déconnexion

```ts
// web
await auth.use('web').logout()

// mobile
await auth.use('api').invalidateToken()
await SecureStore.deleteItemAsync('auth.token')
queryClient.clear()
```

## 5. Révocation

- changement de mot de passe : révoquer tous les tokens ;
- déconnexion d'un appareil : révoquer ce token ;
- admin : révocation globale ;
- journaliser l'événement sans token.

## 6. Tests

- code valide, expiré, réutilisé ;
- email inconnu : même réponse ;
- rate-limit ;
- session web et CSRF ;
- token mobile valide, expiré, révoqué ;
- mode partagé ;
- accès croisé.
