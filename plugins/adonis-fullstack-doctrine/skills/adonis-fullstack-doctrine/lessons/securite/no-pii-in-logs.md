# Données personnelles dans les logs

- Date : 2026-11-07
- Catégorie : sécurité
- Source : retour d’expérience

## Erreur

Un contrôleur logue `request.body()` ou un payload fournisseur pour déboguer. Le log contient un email, un téléphone, un token ou une adresse. Il est agrégé, copié et conservé bien plus longtemps que la requête.

## Correction

- Logger un identifiant, un statut ou un hash, jamais la valeur.
- Configurer `pino` redact pour `authorization`, `cookie`, `password`, `token`, `secret`.
- Ne jamais logger `request.body()` ni `request.all()`.
- Appliquer la même politique à Sentry via `beforeSend`.

## Règle

`hb.ops-logs`, `hb.data-pii` : logs redacted, aucune PII en clair, aucun payload brut.

## Vérification

- Un test vérifie qu'un token n'apparaît pas dans la sortie de log.
- La configuration redact est versionnée.
- Une revue de données vérifie les nouveaux champs sensibles.
