# Action relancée avant la fin de son premier await

- Date : 2026-11-18
- Catégorie : formulaires
- Source : projet pilote (olau)

## Erreur

Une action ouvre un sélecteur, une caméra ou une fenêtre système, puis enregistre une opération. Le garde `isSubmitting` est posé après le premier `await`. Deux appuis rapides ouvrent deux fois la fenêtre et créent deux pièces jointes.

## Correction

- Poser un verrou synchrone (`useRef`) avant le premier `await`.
- Le libérer dans `finally`, y compris sur annulation ou refus de permission.

## Règle

`forms.md#mobile` : une action ne peut pas partir deux fois. Aucune règle du manifeste ne porte encore ce point.

## Vérification

- Deux appuis rapides : une seule ouverture et une seule opération.
- Annulation puis nouvel appui : l'action repart.
