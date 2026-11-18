# Noms de tables et de colonnes Lucid dans le SQL brut

- Date : 2026-11-18
- Catégorie : serveur
- Source : projet pilote (olau)

## Erreur

Un modèle sans `static table` dépend du nom déduit par Lucid ; un renommage de classe change la table visée. Une requête brute ou un `join` utilise le nom camelCase de l'attribut au lieu de la colonne physique snake_case. Un `select` partiel omet la colonne stockée derrière un getter, qui renvoie alors `undefined`.

## Correction

- Déclarer `static table` sur chaque modèle.
- Dans `db.raw`, `whereRaw`, `join` et `select` explicites, utiliser les colonnes physiques snake_case.
- Un `select` partiel inclut toutes les colonnes lues par les getters et la sérialisation.

## Règle

`hb.data-lucid` (modèles Lucid), précisé dans `data.md#lucid`.

## Vérification

- Test d'intégration MariaDB pour chaque requête brute ou jointure.
- `grep -rn "static table" app/models` couvre tous les modèles.
