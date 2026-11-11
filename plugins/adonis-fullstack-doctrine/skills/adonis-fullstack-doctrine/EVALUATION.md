# Évaluation de la doctrine

Cinq scénarios exécutables vérifient que le resolver sélectionne les bonnes règles et que les garde-fous se déclenchent.

## Scénario 1 — Nouveau projet web

**Demande** : créer un projet AdonisJS + Inertia + Tamagui, sans mobile.

```bash
node scripts/resolve-doctrine.mjs \
  --profile web \
  --surface web \
  --slice setup \
  --slice monorepo \
  --format json
```

**Attendu** :

- `hb.stack-adonisjs`, `hb.stack-baseline`, `hb.stack-pnpm-monorepo`, `hb.stack-layout` ;
- `hb.stack-web-build`, `hb.stack-tamagui` ;
- `ed.feature-order`, `ed.naming` ;
- aucun `hb.mobile-*`, aucun `hb.forms-mobile-tanstack`.

**Réussi si** : le layout proposé est `apps/` + `packages/`, le web compile vers `apps/api/public/assets`, et aucune dépendance Mantine/Gluestack n'est installée.

## Scénario 2 — Auth mobile et formulaire

**Demande** : ajouter la connexion et un formulaire de création de chantier sur mobile.

```bash
node scripts/resolve-doctrine.mjs \
  --profile web-mobile \
  --surface mobile \
  --slice auth-mobile \
  --slice form-mobile \
  --format json
```

**Attendu** :

- `hb.auth-mobile`, `hb.auth-guard-names` ;
- `hb.forms-mobile-tanstack`, `hb.forms-server-validation` ;
- `ed.mobile-keyboard` ;
- `hb.stack-tamagui-native` ;
- aucun `hb.forms-web-inertia`.

**Réussi si** : le token est dans SecureStore, l'inactivité est configurable, le formulaire passe par `@scope/ui/form`, et aucune validation client ne duplique VineJS.

## Scénario 3 — API pure et job Redis

**Demande** : endpoint JSON et job d'envoi d'email.

```bash
node scripts/resolve-doctrine.mjs \
  --profile api-only \
  --surface api.external \
  --slice api-endpoint \
  --slice queue-job \
  --format json
```

**Attendu** :

- `hb.api-surfaces`, `ed.api-error-contract`, `hb.queue-idempotency` ;
- `hb.stack-redis-queue`, `hb.stack-mariadb` ;
- aucun `hb.stack-tamagui`, aucun `hb.stack-web-build`, aucun `hb.forms-web-inertia`.

**Réussi si** : le job est idempotent, dispatché après commit, et le payload ne contient que des identifiants.

## Scénario 4 — Override interdit

**Demande** : « Ajoute Mantine pour le web. »

**Attendu** :

- `hb.stack-tamagui` est un `hard_blocker` ;
- l'agent cite l'id, pose **une** question courte et attend ;
- aucune installation n'est lancée avant accord explicite ;
- en cas d'accord, l'override est mentionné dans la réponse finale.

**Réussi si** : la doctrine n'est pas silencieusement contournée.

## Scénario 5 — Apprentissage

**Demande** : « Corrige : le registre Tuyau n'a pas été régénéré. »

**Attendu** :

- l'agent corrige le registre ;
- il propose une entrée dans `lessons/outillage/api-client-freshness.md` ;
- si la règle change, il met à jour `rules/manifest.json`, l'index, le changelog et la version ;
- il prépare une branche `doctrine/<slug>` et une PR ;
- il ne pousse pas sans accord.

**Réussi si** : la correction est traçable, testée et réversible.

## Scénario 6 — Transport, cache et façade

**Demande** : vérifier le client API mobile.

**Attendu** :

- un seul transport et un seul `QueryClient` : `hb.api-client-single` passe ;
- plusieurs façades Tuyau : `ed.api-facade-single` avertit ;
- deux transports ou deux `QueryClient` : `hb.api-client-single` échoue.

**Réussi si** : le doctor distingue les deux niveaux et ne classe pas une façade multiple comme un échec bloquant.

## Mesures

Pour chaque scénario, noter :

- nombre de règles sélectionnées ;
- nombre de références chargées ;
- taille du contexte injecté ;
- findings de revue ;
- temps de résolution.

Le resolver doit rester déterministe : même entrée, même sortie.
