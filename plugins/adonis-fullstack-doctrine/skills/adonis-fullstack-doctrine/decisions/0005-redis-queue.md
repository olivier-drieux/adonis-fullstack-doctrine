# 0005 — Queue Redis uniquement

- Date : 2026-11-07
- Source : arbitrage utilisateur
- Statut : acceptée

## Contexte

Le driver database d'AdonisJS reste simple, mais il couple les jobs au serveur HTTP et à la base. Redis sépare la file et absorbe les pics.

## Décision

`@adonisjs/queue` avec le driver Redis en développement, test d'intégration et production. `sync` est réservé aux tests unitaires.

## Conséquences

- Redis devient une dépendance d'infrastructure obligatoire.
- Compose fournit Redis avec `appendonly yes` et `maxmemory-policy noeviction`.
- Un health check Redis fait partie du gate générique.
- Les payloads ne contiennent que des identifiants, jamais de données personnelles.
- Aucune dérogation au driver Redis n'est prévue.
