# Migrations MariaDB : ordre et transitions de données

- Date : 2026-11-18
- Catégorie : serveur
- Source : projet pilote (olau)

## Erreur

Une migration appelle `this.schema.alterTable(…)` puis `await this.db…update()` dans `up()`. Lucid met les appels `this.schema` en file et les exécute après `up()` : la mise à jour part avant le DDL. Un `await this.schema…` n'y change rien et exécute le DDL deux fois. Une autre supprime une colonne indexée avant sa clé étrangère et échoue. Après un échec, la migration est relancée sur une base à moitié modifiée : MariaDB ne rollback pas le DDL.

## Correction

- `this.schema.*` sans `await` ; le travail de données dans `this.defer(async (db) => …)`, exécuté dans l'ordre de la file, après le DDL qui le précède.
- Suppression dans l'ordre : clé étrangère, puis index, puis colonne. Nommer la contrainte : `dropForeign(cols, name)`.
- Relâcher la contrainte (nullable, unique, FK) avant une réécriture de données, puis la remettre.
- Écrire chaque étape pour qu'une relance après échec partiel reste possible.

## Règle

`hb.data-migrations` : une migration porte sa transition de données et se teste en reprise partielle.

## Vérification

- Montée sur base vide et sur base avec données.
- Échec provoqué au milieu, puis relance.
- Rollback quand il est supporté.
