# 0007 — Boucle d'apprentissage de la doctrine

- Date : 2026-11-07
- Source : demande utilisateur
- Statut : acceptée

## Contexte

Les leçons et les changelogs documentent les corrections, mais sans boucle complète **correction → règle → preuve**. Une règle peut donc changer sans test ni trace.

La boucle doit rester dans le dépôt de la doctrine, pas dans la mémoire d'une session.

## Décision

Quand une correction change une règle, contredit une règle existante ou révèle une erreur répétée :

1. qualifier : correctif local, leçon ou décision ;
2. chercher une entrée existante ;
3. rédiger contexte, correction, règle, vérification ;
4. mettre à jour le manifeste si nécessaire ;
5. régénérer l'index ;
6. exécuter les tests ;
7. ouvrir une PR avec le delta de règle et la preuve.

L'agent détecte et propose ; il ne pousse jamais sans accord. Une commande `/doctrine-learn` permet de déclencher la procédure explicitement.

## Conséquences

- `lessons/` et `decisions/` deviennent des artefacts vivants.
- `lessons/inbox.md` recueille les corrections brutes d'une session.
- Toute entrée porte une date, une source et une vérification.
- Une correction propre à un projet reste dans le projet.
- Un changement de règle sans décision, changelog et test est un hard blocker.
