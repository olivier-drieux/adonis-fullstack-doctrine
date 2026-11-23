# 0011 — Contrôleurs partagés entre `api.internal` et `api.external`

- Date : 2026-11-23
- Source : correction utilisateur (Olau, audit du 23 novembre 2026)
- Statut : acceptée ; amende la décision 0006

## Contexte

La décision 0006 imposait des contrôleurs distincts par surface. Sur Olau, l'audit du 23 novembre 2026 constate que les 32 contrôleurs de `api_external/` copient ceux de `api_internal/`. Seuls changent la garde (`api` ou `web`) et le préfixe d'URL. Un contrôleur de 243 lignes est identique à la garde près.

Chaque correction se fait donc deux fois. Un oubli crée un écart de sécurité entre le navigateur et le mobile : la duplication affaiblit la frontière qu'elle devait protéger.

L'utilisateur fixe la règle : quand une décision contredit un constat d'audit, l'audit prime et la décision est amendée.

## Décision

- Chaque surface garde son fichier de routes et sa chaîne de middleware. Cette part de 0006 est inchangée.
- Un même contrôleur peut servir `api.internal` et `api.external` quand seule la garde diffère.
- Le contrôleur lit l'utilisateur par `ctx.auth.getUserOrFail()`, sans nom de garde. La garde est fixée par le middleware d'authentification de la route.
- Le préfixe d'URL et le nom de route viennent du fichier de routes de la surface, jamais du contrôleur.
- Aucun partage avec `web` (Inertia), `public`, `webhooks` ou `runtime` : leurs entrées, réponses et preuves d'identité diffèrent.
- Un contrôleur dont le comportement change selon la surface (réponse, champs, droits) redevient distinct : le partage ne vaut que pour un comportement identique.
- Un fichier de routes de surface ne naît qu'avec sa première route. Aucun fichier vide n'est créé par anticipation.

## Vérification technique

Dans `@adonisjs/auth` 10.1.0, `Authenticator.getUserOrFail()` sans argument lit la garde mémorisée par `authenticateUsing()` lors de sa dernière tentative (`build/auth_manager-*.js`, méthodes `authenticateUsing` et `getUserOrFail`). Le middleware `auth` de la route détermine donc la garde. Sur une route sans middleware d'authentification, l'appel lève une erreur : le contrôleur partagé n'est monté que derrière ce middleware.

## Conséquences

- Une correction de contrôleur s'applique aux deux surfaces API en une fois.
- La frontière de sécurité reste structurelle : routes, middleware, garde et CSRF restent propres à chaque surface.
- Les tests fonctionnels couvrent chaque surface montée (garde acceptée, garde refusée, CSRF), pas seulement le contrôleur.
- `adv.small-duplication` ne justifie pas de copier un contrôleur entre surfaces API.

## Règles affectées

- `hb.api-surfaces` : texte modifié, identifiant inchangé.
- `references/api.md#surfaces`.
- Décision 0006 : clause « des contrôleurs par surface » amendée.

## Vérification

- `pnpm doctrine:test`
- `pnpm doctrine:check`
- Revue : un contrôleur partagé n'apparaît que dans `api_internal.ts` et `api_external.ts`, derrière leur middleware `auth`, et n'appelle jamais `auth.use('web')` ni `auth.use('api')`.
