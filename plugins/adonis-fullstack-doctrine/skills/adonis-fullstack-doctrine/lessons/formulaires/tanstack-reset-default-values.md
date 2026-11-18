# reset TanStack Form effacé par des defaultValues instables

- Date : 2026-11-18
- Catégorie : formulaires
- Source : projet pilote (olau)

## Erreur

Un écran charge ses données puis appelle `form.reset(valeurs)`. Sans option, `reset` remplace aussi `options.defaultValues` par ces valeurs. Au rendu suivant, `useForm` repasse les `defaultValues` du composant : la comparaison structurelle diffère, le formulaire n'est pas touché, et TanStack Form réécrit les champs avec les défauts vides. Les valeurs serveur disparaissent sans erreur.

## Correction

- Charger les données serveur avec `form.reset(valeurs, { keepDefaultValues: true })`.
- `isDirty` et `isDefaultValue` se comparent alors aux défauts du composant, pas aux valeurs serveur : en tenir compte pour une barre « modifications non enregistrées ».

## Règle

`hb.forms-mobile-tanstack` (TanStack Form côté mobile), précisé dans `forms.md#mobile`.

## Vérification

- Ouvrir l'écran sans toucher un champ : les valeurs serveur restent affichées.
- Refaire après une saisie, un enregistrement et un `reset`.
