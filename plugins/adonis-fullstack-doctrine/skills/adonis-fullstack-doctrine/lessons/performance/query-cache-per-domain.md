# Cache TanStack Query réglé globalement

- Date : 2026-11-18
- Catégorie : performance
- Source : projet pilote (olau)

## Erreur

Le `QueryClient` a un `staleTime: 0` global et un `gcTime` court. Des écrans préchargés sont collectés avant leur première ouverture. Des composants lisent `isStale` ou `isFetching` et se redessinent à chaque revalidation, ce qui provoque des saccades.

## Correction

- `staleTime` et `gcTime` fixés par domaine : longs pour le référentiel, courts pour les données sensibles.
- Précharger après l'affichage du premier contenu, pas à l'ouverture de l'application.
- Lire la fraîcheur depuis le cache (`queryClient.getQueryCache().find({ queryKey })?.isStaleByTime(staleTime)`) au moment utile, pas par abonnement de rendu.

## Règle

`hb.api-client-single` (un seul `QueryClient`), précisé dans `mobile.md#api-client` pour le réglage par domaine.

## Vérification

- Trois allers-retours d'onglet en release : aucun chargement pendant la fenêtre de fraîcheur.
- `grep -rn "\.isStale\b\|\.isFetching" apps/mobile/src` justifie chaque usage.
