# Accessibilité Tamagui : rôles natifs et focus de dialogue

- Date : 2026-11-18
- Catégorie : interfaces
- Source : projet pilote (olau)

## Erreur

Une brique d'interrupteur dérivée d'une case à cocher s'affiche encore comme une case sur Android, et TalkBack ne peut pas l'activer. Une brique partagée transmet `accessibilityRole` ou `accessibilityViewIsModal` au DOM : React avertit, et le rôle `menu` manque sur le web. Un dialogue s'ouvre avec le focus sur « Fermer » ; deux corrections par `setTimeout` ou `requestAnimationFrame` perdent contre le piège de focus.

## Correction

- Interrupteur natif : `Pressable` avec `accessibilityRole="switch"`, `accessibilityState={{ checked, disabled }}` et `focusable`. Sur le web : `role="switch"`, `aria-checked`, Espace et Entrée.
- Brique partagée : `role` et `aria-*` sur le web, `accessibilityRole` et `accessibilityState` sur le natif, séparés par plateforme.
- Focus initial : une prop optionnelle du dialogue branchée sur `onOpenAutoFocus`, qui appelle `details.cancel()` puis `target.focus()`. `details.isCanceled` empêche le piège de focus de viser le premier contrôle. Pas de minuterie.

## Règle

`hb.ui-role-brick` : la brique porte l'accessibilité de son rôle sur chaque plateforme.

## Vérification

- Activation réelle avec TalkBack.
- Aucune prop inconnue dans la console du navigateur.
- Après ouverture du dialogue, `document.activeElement` est le champ attendu.
