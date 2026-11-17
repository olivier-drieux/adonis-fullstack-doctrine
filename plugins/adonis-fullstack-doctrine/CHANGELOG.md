# Changelog

## 0.5.0 — 2026-11-17

### Added

- `hb.ui-role-brick` : une brique partagée par rôle d'interface, identique web et natif, dès la première occurrence.
- `hb.ui-no-visual-literals` : aucune couleur, rayon, ombre, taille ou espacement littéral hors des tokens.
- `ed.ui-style-guard` : catalogue des rôles et garde automatique dans le gate `verify`.
- Doctor : vérification `ui.literals` en avertissement (couleurs, rayons, tailles de police et interlignes littéraux, raccourcis Tamagui compris, dans `apps/*` et `packages/*` hors `ui`). Commentaires, ancres, `url(#…)` et sélecteurs ignorés.
- Exceptions limitées à des fichiers : `files` (un glob ou une liste) dans `.doctrine-exceptions.json`.
- Leçon `lessons/interfaces/ui-style-drift.md`.
- Référence `tamagui.md#roles` et décision `0009-ui-role-bricks.md`.

### Changed

- `adv.small-duplication` ne s'applique plus aux rôles d'interface.

## 0.4.0 — 2026-11-09

### Added

- Décision `0010-commits-english.md` : sujet en anglais au format Conventional Commits.
- Tests de `check-versions.mjs` sur un dépôt factice.

### Changed

- `doctor` analyse le dossier courant quand `--path` est absent.
- Registre `exceptions.md` : aucune exception active.

## 0.3.0 — 2026-11-07

### Changed

- `hb.api-client-single` vise uniquement le transport HTTP et le `QueryClient`.
- `mobile.md#api-client` distingue transport, cache et façade.

### Added

- `ed.api-facade-single` : une façade Tuyau partagée, avertissement si plusieurs.
- Décision `0008-api-client-facades.md`.
- Le doctor rend deux vérifications : `api.transport` et `api.facade`.

## 0.2.1 — 2026-11-07

### Fixed

- Le doctor ignore les fichiers de test, de smoke et de fixtures dans le comptage des transports et des caches.
- Le doctor compte le `QueryClient` du dossier `app/` mobile et exclut les tests de la frontière UI.
- Le template mobile partage le `queryClient` du client au lieu d'en créer un second.

## 0.2.0 — 2026-11-07

### Added

- `doctor.mjs` : audit d'un projet contre la doctrine, avec exceptions `.doctrine-exceptions.json`.
- Tests d'évaluation exécutables pour les cinq scénarios.
- Vérification des liens locaux et de la cohérence des versions.
- Templates `web` et `web-mobile`, avec contrôle automatique par le doctor.
- Checklist pré-pilote réutilisable.
- Registre `exceptions.md`.
- Hook pre-push et script d'installation.

## 0.1.0 — 2026-11-07

### Added

- Initial fail-closed doctrine for AdonisJS 7 + Inertia 3 + React 19 + Tamagui, with optional Expo/React Native mobile.
- Profiles `web`, `web-mobile` and `api-only`.
- Six HTTP surfaces: `web`, `api.internal`, `api.external`, `webhooks`, `runtime`, `public`.
- Typed rule manifest with 55 rules, deterministic resolver, lazy reference reader and generated index.
- References for setup, monorepo, API, web, mobile, Tamagui, forms, auth, data, queue, lists/images, testing, operations and data protection.
- Pattern guides for CRUD web, API resource, auth flow, mobile screen, background job and doctrine learning.
- Decision journal and lesson collection, including `/doctrine-learn`.
- `doctrine-reviewer` and `data-protection-reviewer` sub-agent contracts.
