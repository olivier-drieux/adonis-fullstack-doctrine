# Dates UTC entre Luxon, Lucid et MariaDB

- Date : 2026-11-18
- Catégorie : serveur
- Source : projet pilote (olau)

## Erreur

Un `DateTime` Luxon local est passé tel quel au query builder, ou la connexion MariaDB n'a pas de fuseau explicite. Les bornes de requête sont décalées d'une ou deux heures selon la saison. Un test qui injecte une horloge contrôlée reste vert alors que `autoCreate` écrit l'heure réelle du serveur.

## Correction

- Stocker et comparer en UTC : `.toUTC()` avant écriture, `.toJSDate()` pour les paramètres du query builder.
- Connexion `mysql2` avec `timezone: 'Z'`.
- Calculer les jours civils dans le fuseau métier (par exemple `Europe/Paris`), puis convertir les bornes en UTC.
- `autoCreate` et `autoUpdate` utilisent l'heure système. Quand le test contrôle l'horloge, renseigner la colonne explicitement.

## Règle

`hb.data-lucid` : les conversions ont lieu au boundary, voir `data.md#dates`.

## Vérification

- Test d'une requête par jour civil autour d'un changement d'heure.
- Lecture brute de la ligne : la valeur stockée est en UTC.
