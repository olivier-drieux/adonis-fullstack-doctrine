# ScrollView et clés d'index sur une liste longue

- Date : 2026-11-07
- Catégorie : performance
- Source : audit d’interface (0 FlatList, 31 ScrollView)

## Erreur

Une liste de plusieurs centaines d'éléments est rendue dans un `ScrollView` avec `.map`. Tous les enfants sont montés, la mémoire grimpe, le scroll saccade. La clé est l'index, donc un ajout ou une suppression décale les composants et perd leur état.

## Correction

- FlashList au-delà de 20 éléments.
- `keyExtractor` stable : identifiant métier.
- `estimatedItemSize` réaliste.
- Cellules mémoïsées.
- `getItemType` quand les hauteurs varient.

## Règle

`ed.mobile-lists` : FlashList pour les collections longues, clés stables, cellules mémoïsées.

## Vérification

- Test de scroll avec 200+ éléments.
- Aucune clé d'index dans `keyExtractor`.
- Le temps de rendu initial reste borné.
