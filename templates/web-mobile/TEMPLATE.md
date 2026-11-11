# Template web + mobile

Ce template complète `templates/web/` avec la couche native.

## Mise en place

1. Appliquer d'abord `templates/web/`.
2. Créer `apps/mobile` avec Expo.
3. Copier `files/` par-dessus.
4. Fusionner les dépendances de `apps/mobile/package.json`.
5. Configurer `EXPO_PUBLIC_API_URL` et le scheme dans `app.config.ts`.
6. Vérifier Metro avec le workspace pnpm.

## Contenu

```text
files/
└── apps/mobile/
    ├── app/                  expo-router
    ├── src/api/client.ts     transport Tuyau unique + QueryClient unique
    ├── app.config.ts
    └── metro.config.js
```

## Stack mobile

- Expo + React Native + Expo Router ;
- Tamagui via `@scope/ui` ;
- `@tanstack/react-form` via l'adaptateur `@scope/ui/form` ;
- `@tanstack/react-query` + Tuyau ;
- `expo-secure-store` pour le token ;
- FlashList pour les listes longues ;
- `expo-image` pour les images distantes ;
- `react-native-keyboard-controller` pour les formulaires ;
- Tamagui Sheet/Dialog pour les panneaux ;
- Sentry.

## Vérification

```bash
node <doctrine>/scripts/doctor.mjs --path . --profile web-mobile
```

Le doctor doit sortir sans échec bloquant. Le template ne contient pas de formulaire complet : l'adaptateur `@scope/ui/form` est à écrire selon les types TanStack Form installés.
