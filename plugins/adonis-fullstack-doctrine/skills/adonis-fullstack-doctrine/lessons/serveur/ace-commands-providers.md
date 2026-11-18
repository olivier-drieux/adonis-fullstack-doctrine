# Commande planifiée et service configuré par un provider

- Date : 2026-11-18
- Catégorie : serveur
- Source : projet pilote (olau)

## Erreur

Une commande Ace est documentée « à lancer périodiquement » et testée, mais aucun compose, timer ni provider ne la lance : en production, aucun envoi ne part. Une classe dont le constructeur prend des options lues dans la config est injectée directement : le conteneur ne peut pas deviner ces options.

## Correction

- Une tâche périodique est livrée quand elle est planifiée : job `@adonisjs/queue` planifié par cron dans le `boot()` d'un provider, limité à l'environnement `web` et hors test, qui appelle les mêmes services que la commande.
- Un test vérifie la planification par le provider.
- Une classe dont le constructeur lit la config est liée par une factory dans un provider : `this.app.container.singleton(X, () => new X(config.get(…)))`.

## Règle

`adv.prefer-adonis-primitives` et `ed.service-layer` : utiliser les points d'extension du framework, pas un câblage implicite.

## Vérification

- Test du provider : le job planifié apparaît avec son identifiant et sa fréquence.
- Test du service avec une config remplacée.
