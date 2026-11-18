# Page Inertia chargée par un effet

- Date : 2026-11-18
- Catégorie : interfaces
- Source : projet pilote (olau)

## Erreur

Une page Inertia affiche un spinner, puis lance des appels internes dans un `useEffect` au montage (liste, puis détail, un appel par ligne). Chaque vague ajoute un aller-retour : sur un écran de détail, trois vagues coûtaient 630 ms contre 260 ms avec les props.

## Correction

- Le contrôleur fournit en props toutes les données du premier rendu.
- `defer` pour un bloc lent, reload partiel pour un rafraîchissement.
- Aucun appel réseau au montage pour le contenu principal.

## Règle

`web.md#data-loading` : une page Inertia possède ses données. Aucune règle du manifeste ne porte encore ce point.

## Vérification

- Entrée directe sur la page : zéro requête `xhr`/`fetch` pour le contenu principal.
- Mesure avec un délai fixe par réponse (150 ms).
