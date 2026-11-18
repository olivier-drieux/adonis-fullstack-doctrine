# Données

## MariaDB

MariaDB est le moteur canonique, via Lucid et le client `mysql2`.

```ts
// config/database.ts
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

export default defineConfig({
  connection: 'mariadb',
  connections: {
    mariadb: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        timezone: 'Z',
      },
    },
  },
})
```

- SQLite en mémoire uniquement pour les tests rapides.
- PostgreSQL, MySQL stricto sensu et les autres moteurs exigent une décision explicite.
- Les JSON columns, CTEs, window functions et index full-text divergent : tester sur MariaDB isolée.

## Lucid

- Un modèle par table, relations dans le modèle, `static table` explicite.
- Pas de repository au-dessus de Lucid pour le code ordinaire.
- Les agrégats de requête modèle sont dans `$extras` :

```ts
const rows = await Project.query().withCount('visits')
const count = Number(rows[0].$extras.visits_count ?? 0)
```

`row.visits_count` vaut `undefined`, et `Number(undefined)` produit `NaN` puis `null` en JSON.

- Les booléens `tinyint(1)` sont coercés au boundary du modèle (`consume`/`prepare`), pas dans les contrôleurs.
- Les colonnes JSON sont normalisées au boundary : distinguer `null`, vide et malformé.
- Les mutations conditionnelles vérifient le nombre de lignes affectées.
- SQL brut, `join` et `select` explicites : colonnes physiques snake_case. Un `select` partiel inclut les colonnes lues par les getters.

## Migrations

Une migration qui change la sémantique porte aussi la transition de données.

- Backfill des nouvelles colonnes utilisées par les quotas, filtres ou statuts.
- Documenter les lignes nulles legacy.
- Vider ou purger les jobs avant de supprimer une colonne ou une classe dont le payload dépend.
- Signaler les `down()` lossy.
- Regrouper les réécritures d'enum MariaDB.
- Tester : installation neuve, montée avec données, reprise partielle, rollback supporté, re-montée.
- Sérialiser les runners de migration au déploiement.
- `this.schema.*` est mis en file et exécuté après `up()`, sans `await`. Le travail de données va dans `this.defer`, sinon il part avant le DDL.
- Suppression dans l'ordre : clé étrangère (`dropForeign(cols, name)`), index, colonne.
- Relâcher une contrainte avant de réécrire les données, puis la remettre.
- MariaDB ne rollback pas le DDL : chaque étape doit supporter une relance après échec partiel.

```ts
export default class AddProjectStatus extends BaseSchema {
  async up() {
    this.schema.alterTable('projects', (table) => {
      table.string('status').notNullable().defaultTo('draft')
    })
    this.defer(async (db) => {
      await db.from('projects').update({ status: 'active' }).whereNotNull('activated_at')
    })
  }

  async down() {
    this.schema.alterTable('projects', (table) => {
      table.dropColumn('status')
    })
  }
}
```

## Transactions

- Écritures multiples : transaction explicite.
- Lecture puis écriture concurrente : `forUpdate()` ou claim atomique conditionnel.
- Effets de bord externes hors transaction quand c'est possible.
- Jobs dépendants dispatchés après le commit.

## Dates

- Stockage et comparaisons en UTC : `.toUTC()` avant écriture, `.toJSDate()` pour les paramètres du query builder.
- Connexion `mysql2` avec `timezone: 'Z'`.
- Jours civils calculés dans le fuseau métier (par exemple `Europe/Paris`), bornes converties en UTC.
- `autoCreate` et `autoUpdate` lisent l'heure système, pas l'horloge injectée : renseigner la colonne quand le test contrôle le temps.

## Rétention

Tout journal, audit, historique ou token a une finalité, une durée et une purge. Les données personnelles ne sont pas conservées « au cas où ».
