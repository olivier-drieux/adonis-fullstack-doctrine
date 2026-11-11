# Template web

## Contenu

```text
files/
├── apps/
│   ├── api/                  AdonisJS 7, config queue/logger/database, routes
│   └── web/                  React 19, Inertia 3, Vite 8, Tamagui
├── packages/
│   ├── ui/                   provider Tamagui, primitives, tokens
│   ├── shared-types/         DTO purs
│   └── api-client/           registre Tuyau généré
├── compose.yaml              API, MariaDB, Redis, Caddy
├── Caddyfile
└── scripts/verify.mjs
```

## Mise en place

1. Créer `apps/api` avec le starter AdonisJS `api`.
2. Créer `apps/web` avec Vite + React.
3. Copier `files/` dans le projet.
4. Fusionner les dépendances des `package.json`.
5. Remplacer `packages/ui/src/tamagui.config.ts` par les tokens du projet.
6. Brancher `apps/api/scripts/generate_api_client.mjs` sur `@tuyau/core`.
7. Remplacer `scripts/verify.mjs` par le gate réel.

## Vérification

```bash
node <doctrine>/scripts/doctor.mjs --path . --profile web
```

Le doctor doit sortir sans échec bloquant. Les avertissements restants sont à traiter ou à documenter dans `.doctrine-exceptions.json`.

## À écrire ensuite

- contrôleur et page d'accueil ;
- authentification session/cookie ;
- validateur VineJS ;
- migration et modèle Lucid ;
- tests fonctionnels et unitaires.
