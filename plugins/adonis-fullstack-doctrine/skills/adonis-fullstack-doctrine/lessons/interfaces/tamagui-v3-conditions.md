# Conditions Tamagui v3 sans valeur de base

- Date : 2026-11-18
- Catégorie : interfaces
- Source : projet pilote (olau)

## Erreur

Après la migration vers Tamagui 3, une prop ne porte que sa condition (`flexDirection="phone:column"`, `backgroundColor={{ hover: … }}`). La valeur remplace le défaut du composant : un titre tombe à 0 px. La conversion laisse aussi des tokens `true` réservés, et la v3 ne pose plus le poids de police sur les conteneurs : les liens HTML bruts passent de gras à normal. Les types et le build restent verts.

## Correction

- Toujours écrire la valeur de base avant la condition : `"row phone:column"`, `{ default: …, hover: … }`.
- Ne pas définir de clé `true` dans les échelles de tokens du projet (`size.true`…) : la v3 la refuse au rendu. Raccorder l'ancienne valeur à une clé explicite.
- Hériter le poids de police explicitement pour le HTML brut, via la variable de poids de la police du projet (par exemple `var(--f-weight-base)`).
- `useMedia` garde sa valeur du premier rendu en 3.2.0 : le lire en tête de composant, pas dans une branche.

## Règle

`hb.stack-tamagui` (instance unique), précisé dans `tamagui.md#pitfalls` pour la v3.

## Vérification

- Recherche des props qui ne portent qu'une condition (`="(phone|small|compact):`).
- Mesure des nœuds clés à 390 et 1280 px, comparée à la version précédente.
- `getComputedStyle(...).fontWeight` d'un lien brut avant et après.
