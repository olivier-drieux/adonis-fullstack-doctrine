# Revue de la doctrine

## Contrat

Une revue de doctrine vérifie la conformité d'un diff ou d'une règle, pas le goût personnel.

## Règles du reviewer

- Ne jamais reclasser un `hard_blocker` en `enforced_default` ou `advisory` « pour élargir l'applicabilité ». L'applicabilité large n'est pas un objectif.
- Citer l'id de règle et la ligne concernée.
- Ne pas inventer d'id.
- Ne pas proposer une correction qui contredit une autre règle.
- Ne pas conclure sur la conformité juridique.
- Distinguer un écart de doctrine d'un bug fonctionnel.
- Un `hard_blocker` contourné sans décision est P0.

## Ce que la revue vérifie

1. **Manifeste** : ids uniques, niveaux cohérents, profils/surfaces/tranches valides, références existantes.
2. **Résolution** : le profil, la surface et les tranches du diff produisent les règles attendues.
3. **Références** : les fichiers chargés correspondent aux règles.
4. **Tests** : `pnpm doctrine:test` et `pnpm doctrine:check` passent.
5. **Version** : montée de version, changelog, index à jour si la doctrine change.
6. **Décision** : toute règle nouvelle ou modifiée a une entrée datée.
7. **Apprentissage** : une correction doctrinale est bien qualifiée (leçon ou décision), pas seulement corrigée dans le code.

## Sortie

```md
# Revue de doctrine

## Verdict
- [ ] Conforme
- [ ] Conforme avec réserves
- [ ] Non conforme

## Findings
### P0
...
### P1
...
### P2
...
### P3
...

## Points vérifiés
...

## Limites
...
```

## Revue humaine

L'humain tranche les overrides, les changements de niveau et les renommages d'id. L'agent propose, l'humain valide.
