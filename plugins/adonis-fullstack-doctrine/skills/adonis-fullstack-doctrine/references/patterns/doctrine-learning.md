# Pattern — Apprentissage de la doctrine

## Procedure

1. **Détecter** : correction utilisateur, gate rouge, ou finding de revue.
2. **Qualifier** :
   - correctif local : aucune entrée ;
   - leçon : erreur reproductible sur une règle existante ;
   - décision : choix structurant nouveau ou renversé.
3. **Chercher** une entrée existante dans `decisions/` et `lessons/`.
4. **Rédiger** l'entrée avec contexte, correction, règle, vérification.
5. **Mettre à jour** `rules/manifest.json` si la règle change.
6. **Régénérer** l'index : `pnpm doctrine:write`.
7. **Prouver** : `pnpm doctrine:test` et `pnpm doctrine:check`.
8. **Brancher** : `doctrine/<slug>`.
9. **Committer** : `docs(doctrine): ...` ou `feat(doctrine): ...`.
10. **Ouvrir une PR** avec le gabarit ci-dessous.
11. **Après merge**, la règle est chargée à la prochaine session.

L'agent propose, il ne pousse jamais sans accord.

## Qualification

| Situation | Entrée |
| --- | --- |
| Faute ponctuelle, pas de règle générale | aucune |
| Erreur répétée, règle existante mal appliquée | leçon |
| Nouveau choix de stack, de structure ou de sécurité | décision + règle |
| Contradiction avec un hard blocker | décision explicite |
| Correction propre à un projet | leçon dans le projet, pas dans la doctrine |

## Decision template

```md
# NNNN — Titre

- Date : AAAA-MM-JJ
- Source : correction utilisateur / gate / revue
- Statut : acceptée

## Contexte

...

## Décision

...

## Conséquences

...

## Règles affectées

- `hb...`
- `ed...`

## Vérification

- `pnpm doctrine:test`
- scénario d'évaluation
```

## Lesson template

```md
# Titre

- Date : AAAA-MM-JJ
- Catégorie : outillage / interfaces / formulaires / performance / sécurité
- Source : correction utilisateur / gate / revue

## Erreur

...

## Correction

...

## Règle

...

## Vérification

...
```

## Guardrails

- Aucun changement de règle silencieux.
- Aucune contradiction d'un hard blocker sans décision datée.
- Toute entrée porte une date, une source et un moyen de vérification.
- Chercher avant de créer : pas de doublon.
- Une correction propre à un projet reste dans le projet.
- La PR contient le delta de règle et la preuve, pas seulement le récit.
- Renommer un id de règle est un changement majeur.
- Montée de version + changelog dans le même commit.

## PR template

```md
## Correction

...

## Règle

- Ajout / modification : `hb...`
- Niveau : hard_blocker / enforced_default / advisory
- Référence : `references/...md#...`

## Preuve

- [ ] `pnpm doctrine:test`
- [ ] `pnpm doctrine:check`
- [ ] scénario d'évaluation si le comportement change

## Entrée

- [ ] décision `decisions/NNNN-...md`
- [ ] leçon `lessons/.../...md`
- [ ] les deux
```
