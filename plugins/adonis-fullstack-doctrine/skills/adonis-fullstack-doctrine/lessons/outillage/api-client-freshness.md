# Registre Tuyau périmé après un changement de route

- Date : 2026-11-07
- Catégorie : outillage
- Source : retour d’expérience

## Erreur

Une route est ajoutée, renommée ou supprimée, mais le registre Tuyau n'est pas régénéré. Le typecheck passe sur une machine où le registre a été généré récemment, puis casse sur un clone neuf, un build Docker ou `urlFor` au runtime.

## Correction

Régénérer le registre dans la même modification que la route.

```bash
pnpm --filter api generate:api-client
```

Vérifier que le nombre de routes a changé si la route a changé. Committer le registre.

## Règle

`hb.stack-tuyau` : toute route ajoutée, renommée ou supprimée exige une régénération et un commit du registre dans la même modification.

## Vérification

- Le gate générique vérifie la fraîcheur du registre.
- Un test de contrat échoue si le registre est périmé.
- Un clone neuf doit passer `pnpm typecheck` sans `node ace serve`.
