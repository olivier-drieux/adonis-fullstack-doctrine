# adonis-fullstack-doctrine

Doctrine exécutable pour construire des projets **AdonisJS 7 + Inertia 3 + React 19 + Tamagui**, avec application **Expo/React Native** optionnelle.

Le dépôt fournit un moteur de règles complet : manifeste typé, resolver déterministe, références paresseuses, doctor, tests de contrat et boucle d'apprentissage. Chaque règle est sélectionnée par profil et par tranche de travail.

## Ce que la doctrine verrouille

| Domaine | Choix |
| --- | --- |
| Serveur | AdonisJS 7, Lucid, VineJS, MariaDB |
| Web | Inertia 3, React 19, Vite 8, Tamagui 3 |
| Mobile | Expo, React Native, Expo Router, SecureStore, TanStack Query, TanStack Form |
| UI | Tamagui partagé via `packages/ui`, un seul exemplaire, aucun thème imposé |
| Workspace | pnpm, monorepo permanent, `apps/` + `packages/` |
| Web build | `apps/web` compile vers `apps/api/public/assets`, un seul déploiement |
| API | six surfaces explicites, client Tuyau unique, QueryClient unique |
| Auth | sessions web + tokens mobile, 30 jours d'inactivité, révocation, mode partagé |
| Queue | Redis uniquement, `sync` réservé aux tests |
| Tests | SQLite rapide + MariaDB isolée + gate générique |
| Exploitation | Sentry, Compose, Caddy, sauvegardes MariaDB, logs redacted |
| Apprentissage | correction → leçon/décision → règle → test → PR |

## Profils

| Profil | Usage |
| --- | --- |
| `web` | AdonisJS + Inertia + Tamagui web, sans mobile |
| `web-mobile` | web + Expo/React Native + UI partagée + auth mobile |
| `api-only` | API JSON, sans Inertia ni Tamagui |

Le mobile n'est jamais imposé : `apps/mobile` n'existe que pour `web-mobile`.

## Installation

### Claude Code

```text
/plugin marketplace add https://github.com/olivier-drieux/adonis-fullstack-doctrine.git
/plugin install adonis-fullstack-doctrine@adonis-fullstack-doctrine
```

### Codex

```bash
codex plugin marketplace add https://github.com/olivier-drieux/adonis-fullstack-doctrine.git
```

Puis `/plugins`, sélectionner `adonis-fullstack-doctrine` et installer.

### OpenCode / T3 Code

OpenCode ne scanne pas le cache des plugins Claude Code. Exposer le skill dans son dossier global :

```bash
mkdir -p ~/.config/opencode/skills
ln -sfn /chemin/vers/adonis-fullstack-doctrine/plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine \
  ~/.config/opencode/skills/adonis-fullstack-doctrine
```

Ou déclarer le dossier source dans `~/.config/opencode/opencode.json` :

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "/chemin/vers/adonis-fullstack-doctrine/plugins/adonis-fullstack-doctrine/skills"
  ]
}
```

Le skill apparaît ensuite dans une nouvelle session T3 Code. La session en cours ne recharge pas sa liste de skills à chaud.

### Utilisation directe

Le skill est un dossier autonome :

```text
plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/
```

Il peut être copié ou lié dans un projet, puis chargé par l'agent.

## Usage

Lister les tranches :

```bash
node plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/scripts/resolve-doctrine.mjs --list-slices
```

Résoudre une tâche :

```bash
node plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/scripts/resolve-doctrine.mjs \
  --profile web \
  --surface web \
  --slice setup \
  --slice form-web \
  --format markdown
```

Lire une référence à la demande :

```bash
node plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/scripts/read-reference.mjs forms.md#mobile
```

Vérifier la doctrine :

```bash
pnpm check
```

Ce gate exécute les tests de doctrine, du doctor, des versions et des scénarios, l'index, les liens locaux et les templates. La CI exécute le même gate sur chaque pull request.

## Outils

### Doctor

Audit d'un projet contre la doctrine :

```bash
node plugins/adonis-fullstack-doctrine/skills/adonis-fullstack-doctrine/scripts/doctor.mjs \
  --path /chemin/du/projet \
  --profile web-mobile \
  --format markdown
```

Le doctor sort un rapport par `rule id` : conformes, avertissements, échecs, exceptions. Un écart accepté se déclare dans `.doctrine-exceptions.json` à la racine du projet.

### Templates

```text
templates/web/          AdonisJS + Inertia + Tamagui web
templates/web-mobile/   le template web + Expo/React Native
templates/ops/          checklist pré-pilote
```

Les templates sont des squelettes de fichiers clés, pas des applications complètes. `pnpm templates:check` vérifie qu'ils passent le doctor.

### Hooks Git

```bash
pnpm hooks:install
```

Configure `core.hooksPath=.githooks` :

- le pre-push exécute `pnpm check` ;
- le commit-msg vérifie le sujet Conventional Commits en anglais.

Exemple de sujet accepté : `fix(doctor): ignore test fixtures`.

## Apprentissage

Quand une correction change une règle, contredit une règle existante ou révèle une erreur répétée :

1. l'agent qualifie : correctif local, leçon ou décision ;
2. il cherche une entrée existante ;
3. il rédige contexte, correction, règle, vérification ;
4. il met à jour le manifeste et l'index si nécessaire ;
5. il exécute les tests ;
6. il prépare une branche `doctrine/<slug>` et une PR.

L'agent **propose**, il ne pousse jamais sans accord. La commande `/doctrine-learn` déclenche la procédure.

## Structure

```text
.
├── .claude-plugin/marketplace.json
├── .github/workflows/check.yml
├── .githooks/
│   ├── pre-push
│   └── commit-msg
├── templates/
│   ├── web/
│   ├── web-mobile/
│   └── ops/PILOT-READINESS.md
├── scripts/
│   ├── template-check.mjs
│   ├── check-commit-message.mjs
│   └── install-hooks.mjs
├── plugins/adonis-fullstack-doctrine/
│   ├── .claude-plugin/plugin.json
│   ├── .codex-plugin/plugin.json
│   ├── commands/doctrine-learn.md
│   ├── agents/
│   │   ├── doctrine-reviewer.md
│   │   └── data-protection-reviewer.md
│   └── skills/adonis-fullstack-doctrine/
│       ├── SKILL.md
│       ├── rules/manifest.json
│       ├── rules/manifest-index.json
│       ├── scripts/
│       │   ├── doctor.mjs
│       │   ├── resolve-doctrine.mjs
│       │   ├── read-reference.mjs
│       │   └── *.test.mjs
│       ├── references/
│       ├── decisions/
│       ├── lessons/
│       ├── exceptions.md
│       ├── EVALUATION.md
│       ├── REVIEWING.md
│       └── MAINTENANCE.md
├── AGENTS.md
├── CHANGELOG.md
└── package.json
```

## Limites

- Les versions sont des planchers, pas des versions épinglées. La combinaison doit être revalidée à l'installation.
- La doctrine ne fixe ni base légale ni durée de conservation.
- Les exemples de code sont des squelettes à vérifier contre les types installés.
- Le mobile est optionnel et ne doit pas être ajouté par défaut.

## Licence

MIT.
