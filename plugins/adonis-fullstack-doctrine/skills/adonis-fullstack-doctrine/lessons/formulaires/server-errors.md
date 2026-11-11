# Erreurs serveur non rattachées aux champs

- Date : 2026-11-07
- Catégorie : formulaires
- Source : retour d’expérience

## Erreur

Le formulaire mobile valide côté client avec un schéma dupliqué, puis affiche une erreur globale quand le serveur refuse. Les valeurs saisies sont perdues, le champ fautif n'est pas signalé, et le schéma client diverge de VineJS.

## Correction

- Supprimer le schéma client.
- Laisser VineJS valider.
- Mapper `errors` du serveur dans les field meta de TanStack Form.
- Conserver les valeurs saisies.
- Afficher un `Notice` global pour les erreurs non rattachées.

## Règle

`hb.forms-mobile-tanstack`, `hb.forms-server-validation` : TanStack Form pour l'état, VineJS seule source de validation, erreurs serveur injectées.

## Vérification

- Un test soumet un formulaire invalide et vérifie l'erreur sur le bon champ.
- Les valeurs restent présentes après le refus.
- Aucun `zod`, `yup` ou validateur maison dans le client.
