# Exceptions documentées

Une exception est un écart **accepté et daté** entre un projet existant et une règle de la doctrine. Elle ne modifie pas la règle : elle explique pourquoi ce projet ne la suit pas, et elle reste visible.

## Format

| Projet | Règle | Exception | Justification | Décision | Date |
| --- | --- | --- | --- | --- | --- |

## Règles

- Une exception ne s'applique qu'au projet nommé.
- Elle cite la décision qui la motive.
- Elle est réévaluée quand la règle ou le projet change.
- Un nouveau projet ne peut pas hériter d'une exception existante.
- Un hard blocker sans exception documentée reste bloquant.

## Registre

_Aucune exception active. Toute exception future exige une décision datée et une entrée dans `.doctrine-exceptions.json`._

## Côté projet

Le doctor lit `.doctrine-exceptions.json` à la racine d'un projet :

```json
{
  "hb.stack-layout": { "reason": "DEC-476", "date": "2026-11-07" },
  "hb.stack-redis-queue": { "reason": "S0 database queue", "date": "2026-11-07" }
}
```

Ce fichier doit refléter ce registre. Il ne remplace pas la décision.
