---
name: adonis-fullstack-doctrine
description: >-
  Use when creating, extending, or reviewing a full-stack AdonisJS 7 project with
  Inertia 3 + React 19 + Tamagui web and optional Expo/React Native mobile. Fail-closed
  doctrine for pnpm monorepo layout, six HTTP surfaces, MariaDB/Lucid, Redis queue,
  Tuyau, TanStack Query and TanStack Form, authentication, testing, operations, and
  doctrine learning. Ask exactly one override question on a hard blocker.
metadata:
  version: "0.4.0"
---

# AdonisJS Fullstack Doctrine

## Purpose

Garder les projets AdonisJS 7 sur un chemin unique, framework-native et vérifiable. La doctrine est **fail-closed** : un `hard_blocker` arrête l'implémentation et déclenche une seule question d'override.

La stack est verrouillée, pas générique :

- AdonisJS 7, Lucid, VineJS, MariaDB ;
- Inertia 3 + React 19 + Vite 8 ;
- Tamagui 3 pour le web et le natif ;
- Expo + React Native + Expo Router en option ;
- pnpm, monorepo permanent, `apps/` + `packages/` ;
- Redis pour la queue ;
- Tuyau + TanStack Query côté mobile, TanStack Form pour les formulaires natifs ;
- Inertia Form pour les formulaires web ;
- un seul déploiement API, le web compilé dans `apps/api/public/assets`.

## Profiles

Choisir **exactement un** profil avant de coder :

| Profil | Contenu |
| --- | --- |
| `web` | AdonisJS + Inertia + Tamagui web, sans mobile |
| `web-mobile` | web + Expo/React Native + UI partagée + auth mobile |
| `api-only` | API JSON, sans Inertia ni Tamagui |

## Surfaces

Classer chaque route par rôle, jamais par préfixe :

| Surface | Auth | CSRF |
| --- | --- | --- |
| `web` | session `web` | actif |
| `api.internal` | session `web` | actif |
| `api.external` | tokens `api` | inactif |
| `webhooks` | signature | inactif |
| `runtime` | middleware dédié | inactif |
| `public` | token ou signature | inactif |
| `mobile` | tokens `api` | n/a |

## Execution Protocol

1. **select-profile** — `web`, `web-mobile` ou `api-only`.
2. **select-surface** — la surface de la tâche. Pour une tâche transverse, `cross-cutting`.
3. **list-slices** — choisir la plus petite liste complète : `setup`, `monorepo`, `api-endpoint`, `form-mobile`, `queue-job`, etc. Toute tâche qui touche des données personnelles ajoute `data-protection`.
4. **resolve-rules** — lancer le resolver. Il émet les règles complètes, les références à charger et un mode `typed` ou `conservative`.
5. **load-references-lazily** — lire chaque fichier ou sous-titre **seulement** quand on arrive à cette partie de l'implémentation. Annoncer la référence chargée.
6. **detect-conflicts** — comparer la demande, les conventions du dépôt et les règles applicables. Un `hard_blocker` non respecté arrête.
7. **ask-one-override-question** — citer l'id, poser une question courte, attendre. Ne pas implémenter le chemin divergent avant accord explicite.
8. **implement-and-verify** — coder, puis exécuter le gate générique et les tests de la tranche. Si le doctor est disponible, lancer `node scripts/doctor.mjs --path <projet> --profile <profil>`.
9. **learn** — si une correction change une règle ou révèle une erreur répétée, proposer une leçon ou une décision. Ne jamais pousser sans accord.

```bash
# Les commandes se lancent depuis le dossier du skill.
node scripts/resolve-doctrine.mjs \
  --profile web \
  --surface web \
  --slice setup \
  --slice form-web \
  --format markdown
```

```bash
node scripts/resolve-doctrine.mjs --list-slices
node scripts/read-reference.mjs forms.md#mobile
node scripts/read-reference.mjs --list
```

## Override Handling

- Seuls les `hard_blocker` arrêtent.
- Citer l'id dans une phrase courte, poser **une** question, attendre.
- Un override approuvé vaut pour la tâche courante et doit être mentionné dans la réponse finale.
- `enforced_default` et `advisory` ne déclenchent jamais l'override.
- Un override ne peut pas contredire une décision de sécurité sans décision explicite.

## Learning Loop

Une correction devient doctrinale si elle change une règle, contredit une règle existante ou révèle une erreur répétée.

1. qualifier : correctif local, leçon ou décision ;
2. chercher une entrée existante ;
3. rédiger contexte, correction, règle, vérification ;
4. mettre à jour `rules/manifest.json` si la règle change ;
5. `pnpm doctrine:write` puis `pnpm doctrine:check` ;
6. `pnpm doctrine:test` ;
7. branche `doctrine/<slug>`, commit, PR.

L'agent propose ; il ne pousse jamais en silence. Voir [patterns/doctrine-learning.md](references/patterns/doctrine-learning.md#procedure).

## Reference Map

- **Setup** : `setup.md`
- **Monorepo** : `monorepo.md`
- **API** : `api.md`
- **Web** : `web.md`
- **Mobile** : `mobile.md`
- **Tamagui** : `tamagui.md`
- **Formulaires** : `forms.md`
- **Auth** : `auth.md`
- **Données** : `data.md`
- **Queue** : `queue.md`
- **Listes et images** : `lists-images.md`
- **Tests** : `testing.md`
- **Exploitation** : `operations.md`
- **Protection des données** : `data-protection.md`
- **Patterns** : `patterns/crud-web.md`, `patterns/api-resource.md`, `patterns/auth-flow.md`, `patterns/mobile-screen.md`, `patterns/background-job.md`, `patterns/doctrine-learning.md`
- **Exceptions** : `exceptions.md` (écarts acceptés, projet par projet)
- **Doctor** : `scripts/doctor.mjs` (`--path <projet> --profile web|web-mobile|api-only`)
- **Templates** : `templates/` à la racine du dépôt

## Decisions and Lessons

- `decisions/0001-fondations-doctrine.md`
- `decisions/0002-monorepo-apps-packages.md`
- `decisions/0003-tamagui-shared-ui.md`
- `decisions/0004-tanstack-form-mobile.md`
- `decisions/0005-redis-queue.md`
- `decisions/0006-six-surfaces.md`
- `decisions/0007-doctrine-learning.md`
- `decisions/0008-api-client-facades.md`
- `decisions/0010-commits-english.md`
- `lessons/inbox.md`
- `lessons/outillage/api-client-freshness.md`
- `lessons/interfaces/tamagui-single-instance.md`
- `lessons/formulaires/server-errors.md`
- `lessons/performance/flashlist-keys.md`
- `lessons/securite/no-pii-in-logs.md`
- `exceptions.md` (registre des écarts acceptés)

## Guardrails

- Ne jamais lire tout le manifeste en contexte : utiliser le resolver.
- Ne jamais installer un paquet avant d'avoir vérifié `packages.adonisjs.com` et npm.
- Ne jamais dupliquer un schéma VineJS côté client.
- Ne jamais importer `tamagui` directement dans `apps/web` ou `apps/mobile`.
- Ne jamais committer un registre Tuyau périmé.
- Ne jamais logger un payload, un token ou une donnée personnelle.
- Ne jamais changer une règle sans décision, changelog et preuve.
