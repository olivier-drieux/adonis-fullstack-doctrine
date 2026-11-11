# 0006 — Six surfaces et client mobile unique

- Date : 2026-11-07
- Source : arbitrage utilisateur
- Statut : acceptée

## Contexte

Un contrôleur peut traverser plusieurs surfaces sans que rien ne le signale. Les configurations Tuyau se dupliquent alors par feature.

## Décision

- Six surfaces : `web`, `api.internal`, `api.external`, `webhooks`, `runtime`, `public`.
- Un fichier de routes, une chaîne de middleware et des contrôleurs par surface.
- Un seul module `api.ts` côté mobile, avec Tuyau et injection du token.
- Un seul `QueryClient`, fourni à la racine d'Expo Router.

## Conséquences

- Les frontières de sécurité deviennent structurelles.
- Un contrôleur ne peut pas mélanger session, token, webhook et lien public.
- Les features mobiles consomment le même client et le même cache.
- Un 401 déclenche la déconnexion et le nettoyage du cache à un seul endroit.
- La duplication de configuration Tuyau disparaît.
