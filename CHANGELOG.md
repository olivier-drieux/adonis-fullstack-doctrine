# Changelog

## 0.5.0 — 2026-11-17

### Added

- `hb.ui-role-brick` : une brique partagée par rôle d'interface, identique web et natif, dès la première occurrence.
- `hb.ui-no-visual-literals` : aucune couleur, rayon, ombre, taille ou espacement littéral hors des tokens.
- `ed.ui-style-guard` : catalogue des rôles et garde automatique dans le gate `verify`.
- Doctor : vérification `ui.literals` en avertissement (couleurs, rayons, tailles de police et interlignes littéraux, raccourcis Tamagui compris, dans `apps/*` et `packages/*` hors `ui`). Commentaires, ancres, `url(#…)` et sélecteurs ignorés.
- Exceptions limitées à des fichiers : `files` (globs) dans `.doctrine-exceptions.json`.
- Leçon `lessons/interfaces/ui-style-drift.md`.
- Référence `tamagui.md#roles` et décision `0009-ui-role-bricks.md`.

### Changed

- `adv.small-duplication` ne s'applique plus aux rôles d'interface.

## 0.4.0 — 2026-11-09

### Added

- CI GitHub Actions : `pnpm check` sur push vers `main` et sur chaque pull request.
- Hook `commit-msg` : Conventional Commits en anglais, via `scripts/check-commit-message.mjs`.
- Tests de `check-versions.mjs` sur un dépôt factice.
- Décision `0010-commits-english.md`.

### Changed

- `doctor` analyse le dossier courant quand `--path` est absent.
- Messages de commit en anglais (voir `AGENTS.md`).

### Fixed

- Registre d'exceptions : aucune exception active.

## 0.3.0 — 2026-11-07

### Changed

- `hb.api-client-single` ne vise plus que le transport et le cache ; la façade devient `ed.api-facade-single`.

### Added

- Décision `0008-api-client-facades.md`.
- Doctor : deux vérifications distinctes pour le transport et la façade.

## 0.2.1 — 2026-11-07

### Fixed

- Doctor : comptage des transports et caches hors tests, smoke et fixtures ; prise en compte du dossier `app/` mobile.
- Template mobile : un seul `QueryClient`, partagé avec le client API.

## 0.2.0 — 2026-11-07

### Added

- Doctrine doctor : audit d'un projet contre les règles, sortie par `rule id`, exceptions documentées.
- Évaluation exécutable des cinq scénarios.
- Vérifications des liens locaux et des versions.
- Templates `web` et `web-mobile` validés par le doctor.
- Checklist pré-pilote.
- Registre `exceptions.md`.
- Hook pre-push.

## 0.1.0 — 2026-11-07

### Added

- Initial doctrine for AdonisJS 7 full-stack projects with Inertia React, Tamagui web and optional Expo/React Native mobile.
- Profiles `web`, `web-mobile` and `api-only`.
- Six explicit HTTP surfaces: `web`, `api.internal`, `api.external`, `webhooks`, `runtime`, `public`.
- Typed rule manifest, deterministic resolver, lazy reference reader and generated index.
- References for setup, monorepo, API, web, mobile, Tamagui, forms, auth, data, queue, lists/images, testing, operations and data protection.
- Decision journal and lesson capture workflow, including the `/doctrine-learn` command.
- Doctrine reviewer and data-protection reviewer sub-agent contracts.
