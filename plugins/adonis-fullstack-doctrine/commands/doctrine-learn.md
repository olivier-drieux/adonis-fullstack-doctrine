---
description: Consigne une correction en leçon ou décision et prépare une PR de doctrine.
argument-hint: "[correction observée]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# /doctrine-learn

Transforme une correction en entrée de doctrine vérifiable.

## 1. Lire la procédure

Lire `references/patterns/doctrine-learning.md#procedure` et `#guardrails`.

## 2. Qualifier

- **Correctif local** : faute ponctuelle, aucune règle générale. Ne rien consigner.
- **Leçon** : erreur reproductible sur une règle existante.
- **Décision** : choix structurant nouveau ou renversé, ou contradiction avec un `hard_blocker`.

Si la qualification est ambiguë, poser **une** question courte.

## 3. Chercher

Chercher dans `decisions/`, `lessons/` et `rules/manifest.json` une entrée proche. Ne pas créer de doublon.

## 4. Rédiger

Créer :

- `decisions/NNNN-<slug>.md` avec contexte, décision, conséquences, règles affectées, vérification ;
- ou `lessons/<catégorie>/<slug>.md` avec erreur, correction, règle, vérification.

## 5. Mettre à jour la règle

Si le comportement change :

- modifier `rules/manifest.json` ;
- ajouter ou ajuster la référence ;
- exécuter `pnpm doctrine:write` ;
- exécuter `pnpm doctrine:test` et `pnpm doctrine:check`.

## 6. Préparer la PR

```bash
git switch -c doctrine/<slug>
git add <fichiers>
git commit -m "docs(doctrine): consigner <sujet>"
```

Pousser et ouvrir une PR **seulement après accord explicite**. Le gabarit est dans `references/patterns/doctrine-learning.md#pr-template`.

## 7. Après merge

La règle est chargée à la prochaine session. Vérifier qu'elle apparaît dans le resolver :

```bash
node scripts/resolve-doctrine.mjs --profile <profil> --surface <surface> --slice <tranche> --format markdown
```
