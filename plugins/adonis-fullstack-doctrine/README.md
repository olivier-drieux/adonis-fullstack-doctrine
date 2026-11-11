# adonis-fullstack-doctrine

Doctrine fail-closed pour projets **AdonisJS 7 + Inertia 3 + React 19 + Tamagui**, avec mobile **Expo/React Native** optionnel.

## Ce que le plugin fait

Quand le skill se charge, l'agent suit un protocole déterministe avant d'écrire du code :

1. choisir un profil : `web`, `web-mobile` ou `api-only` ;
2. classer la route par surface : `web`, `api.internal`, `api.external`, `webhooks`, `runtime`, `public` ;
3. choisir les tranches de fonctionnalité ;
4. résoudre les règles complètes avec le resolver ;
5. charger les références à la demande ;
6. détecter les conflits ;
7. poser **une** question d'override sur un `hard_blocker` ;
8. implémenter et vérifier ;
9. consigner une correction en leçon ou décision.

## Profils

| Profil | Contenu |
| --- | --- |
| `web` | AdonisJS + Inertia + Tamagui web |
| `web-mobile` | web + Expo/React Native + UI partagée + auth mobile |
| `api-only` | API JSON, sans Inertia ni Tamagui |

## Stack verrouillée

- AdonisJS 7, Lucid, VineJS, MariaDB ;
- Inertia 3, React 19, Vite 8 ;
- Tamagui 3, un seul exemplaire dans `packages/ui` ;
- Expo, React Native, Expo Router, SecureStore ;
- pnpm, monorepo `apps/` + `packages/` ;
- Redis pour la queue ;
- Tuyau + TanStack Query, TanStack Form mobile ;
- Inertia Form web ;
- Sentry, Compose, Caddy, sauvegardes MariaDB.

## Commandes

Depuis `skills/adonis-fullstack-doctrine/` :

```bash
node scripts/resolve-doctrine.mjs --list-slices
node scripts/resolve-doctrine.mjs --profile web --surface web --slice setup --format markdown
node scripts/read-reference.mjs forms.md#mobile
```

La commande `/doctrine-learn` consigne une correction en leçon ou décision et prépare une PR.

## Doctor et templates

Auditer un projet :

```bash
node plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/scripts/doctor.mjs \
  --path /chemin/du/projet \
  --profile web-mobile
```

Le doctor sort un rapport par `rule id` et lit les exceptions `.doctrine-exceptions.json` du projet.

Templates copiables :

```text
templates/web/          AdonisJS + Inertia + Tamagui web
templates/web-mobile/   le template web + Expo/React Native
templates/ops/          checklist pré-pilote
```

`pnpm templates:check` vérifie qu'ils passent le doctor.

## Agents

- `doctrine-reviewer` : revue read-only du diff contre la doctrine.
- `data-protection-reviewer` : revue PII, chiffrement, sérialisation, logs, rétention, tokens publics.

## Structure

```text
plugins/adonis-fullstack-doctrine/
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── commands/doctrine-learn.md
├── agents/
└── skills/adonis-fullstack-doctrine/
    ├── SKILL.md
    ├── rules/
    ├── scripts/
    ├── references/
    ├── decisions/
    ├── lessons/
    ├── exceptions.md
    ├── EVALUATION.md
    ├── REVIEWING.md
    └── MAINTENANCE.md
```

## Installation

```text
/plugin marketplace add https://github.com/olivier-drieux/adonis-fullstack-doctrine.git
/plugin install adonis-fullstack-doctrine@adonis-fullstack-doctrine
```

Codex :

```bash
codex plugin marketplace add https://github.com/olivier-drieux/adonis-fullstack-doctrine.git
```

Puis `/plugins` et installer `adonis-fullstack-doctrine`.

## Licence

MIT.
