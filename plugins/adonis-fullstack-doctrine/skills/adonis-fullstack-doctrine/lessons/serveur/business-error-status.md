# Erreur métier sans statut 4xx

- Date : 2026-11-18
- Catégorie : serveur
- Source : projet pilote (olau)

## Erreur

Une classe d'erreur métier (conflit, quota, état invalide) étend `Error` sans `status`. Le handler la traite comme une erreur 500 : elle est journalisée au niveau 50 et envoyée à Sentry, alors que le client a seulement fait une demande refusée.

## Correction

- Toute erreur métier attendue porte `status` 4xx (`409`, `422`, `403`…) et un `code` stable.
- Seules les erreurs inattendues restent 500 et atteignent Sentry.

## Règle

`ed.api-error-contract` : contrat `{ code, message }` stable, statut HTTP exact.

## Vérification

- Test fonctionnel : le refus métier renvoie le statut 4xx et le `code` attendu.
- Aucun événement Sentry ni log de niveau `error` pour ce cas.
