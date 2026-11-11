# Tests

## Tiered

Deux niveaux, pour la vitesse et pour la preuve.

| Niveau | Base | Usage |
| --- | --- | --- |
| Rapide | SQLite `:memory:` | logique, validateurs, services sans dialecte |
| Réel | MariaDB isolée | migrations, locks, JSON, concurrence, SQL dialectal |

Un changement qui dépend du dialecte sans preuve MariaDB est incomplet. Un test MariaDB doit utiliser une base dédiée et des connexions indépendantes pour la concurrence.

## Layout

```text
apps/api/tests/
├── functional/       parcours HTTP complets, Japa
├── unit/             logique isolée, node:test ou Japa
└── fixtures/         données fictives
```

- `node:test` pour la logique pure (packages, modèles de présentation).
- Japa pour les parcours AdonisJS (requête, session, CSRF, policy).
- Pas de mock de la base pour un parcours critique.
- Chaque test crée son état, aucun test ne dépend de l'ordre.

## Gates

Le dépôt fournit un gate générique `scripts/verify.mjs` :

```bash
node scripts/verify.mjs
```

Il exécute :

1. `pnpm typecheck` ;
2. `pnpm lint` ;
3. `pnpm test` ;
4. build web ;
5. build mobile si présent ;
6. fraîcheur du registre Tuyau ;
7. migrations à blanc sur MariaDB ;
8. health check Redis ;
9. `pnpm doctrine:check` pour la doctrine elle-même.

Les projets ajoutent des gates de domaine (`verify:projects`, `verify:billing`) sans réécrire le runner. Un gate par lot est autorisé, mais il doit appeler le gate générique.

## Contract tests

- Le manifeste de doctrine est validé (ids, niveaux, profils, surfaces, références).
- Le resolver retourne les règles attendues pour chaque profil.
- Une tranche inconnue bascule en mode conservateur.
- Un index périmé échoue.
- Un changement de route sans régénération Tuyau échoue.

## Ce qu'un test doit prouver

- Le comportement nominal.
- Le refus (403, 404, 409, 422).
- L'absence d'effet de bord sur un refus.
- L'idempotence d'un job.
- La reprise après erreur.
- Le rendu des états vide, chargement et erreur.
