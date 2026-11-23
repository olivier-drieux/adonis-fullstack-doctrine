# 0012 — Verrou seulement pour écrire

- Date : 2026-11-23
- Source : correction utilisateur (Olau, audit du 23 novembre 2026)
- Statut : acceptée

## Contexte

Sur Olau, le service d'accès au chantier verrouillait par défaut le compte, l'adhésion et le projet, même pour une lecture pure (`forUpdate ?? true`). Toutes les lectures d'un même chantier étaient sérialisées, sans gain de cohérence pour une requête qui n'écrit rien.

La doctrine disait seulement : « Lecture puis écriture concurrente : `forUpdate()` ou claim atomique conditionnel ». Elle ne disait pas qu'une lecture pure ne verrouille pas.

## Décision

- Une transaction prend un verrou (`forUpdate()`, `forShare()`) seulement si elle écrit, ou si elle décide d'une écriture d'après la lecture.
- Une lecture pure ne prend aucun verrou. Elle lit l'état courant, transaction comprise si elle en a besoin.
- Un service partagé entre lecture et écriture fixe son défaut d'après l'intention déclarée : sans verrou pour une lecture, avec verrou pour une écriture. Une lecture qui décide d'une écriture demande le verrou explicitement. Le défaut reste sûr : un appelant qui écrit ne peut pas l'oublier.
- L'ordre des verrous reste stable (parent avant enfant, identifiants triés) pour éviter les interblocages.

## Conséquences

- Les lectures concurrentes d'une même ressource ne s'attendent plus.
- Une écriture qui oublie de demander le verrou reste exposée : les tests MariaDB de concurrence portent sur les écritures.

## Règles affectées

- `ed.locks-for-writes` (nouvelle règle).
- `references/data.md#transactions`.

## Vérification

- `pnpm doctrine:test`
- `pnpm doctrine:check`
- Revue : aucun `forUpdate()` ni verrou par défaut dans un chemin de lecture seule.
