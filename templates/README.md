# Templates

Deux squelettes copiables :

- `web/` : AdonisJS 7 + Inertia 3 + React 19 + Tamagui web.
- `web-mobile/` : le template web, plus Expo/React Native, TanStack Form, SecureStore, FlashList et expo-image.

## Mode d'emploi

Les templates ne remplacent pas les générateurs officiels. Le parcours recommandé :

```bash
pnpm create adonisjs@latest apps/api -- --kit=api
pnpm create vite@latest apps/web -- --template react-ts
pnpm create expo-app@latest apps/mobile --template blank-typescript
```

Puis copier les fichiers de `templates/web/files/` (et de `templates/web-mobile/files/` pour le mobile) dans le projet, en fusionnant les `package.json` au lieu de les écraser.

```bash
cp -R templates/web/files/. mon-projet/
cp -R templates/web-mobile/files/. mon-projet/
```

## Vérification

```bash
pnpm install
pnpm typecheck
pnpm verify
node <doctrine>/scripts/doctor.mjs --path . --profile web
node <doctrine>/scripts/doctor.mjs --path . --profile web-mobile
```

`node scripts/template-check.mjs` vérifie que les templates restent structurés et passent le doctor.

## Limites

Ce sont des **squelettes de fichiers clés**, pas des applications complètes. Les contrôleurs, modèles, migrations, tests et écrans métier sont à écrire. Les versions sont des planchers : revalider la combinaison à l'installation.
