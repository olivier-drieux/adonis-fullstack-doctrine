# Changelog

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
