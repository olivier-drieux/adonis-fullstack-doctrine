# Checklist pré-pilote

À copier dans le projet avant un pilote réel. Chaque case doit être cochée ou explicitement reportée avec sa raison.

## Infrastructure

- [ ] VPS ou hébergement dimensionné, accès administrateur documenté.
- [ ] Nom de domaine et DNS pointés, HTTPS actif.
- [ ] `compose.yaml` versionné : API, MariaDB, Redis, Caddy.
- [ ] Health checks réels sur API, MariaDB et Redis.
- [ ] Redis avec `appendonly yes` et politique mémoire `noeviction`.
- [ ] Migrations exécutées au déploiement, sérialisées.
- [ ] Rollback documenté et testé au moins une fois.

## Sauvegardes

- [ ] Sauvegarde MariaDB quotidienne, chiffrée, hors site.
- [ ] Rétention définie et documentée.
- [ ] Restauration testée sur une base vide.
- [ ] Procédure de restauration écrite, avec durée estimée.
- [ ] Sauvegarde des secrets et des variables d'environnement.

## Observabilité

- [ ] Sentry initialisé côté API, web et mobile.
- [ ] DSN par environnement, release et source maps.
- [ ] `beforeSend` filtre les données personnelles.
- [ ] Logs avec `redact` pour tokens, cookies, e-mail, téléphone.
- [ ] Alerte sur erreur 5xx et sur queue en échec.
- [ ] Tableau de bord ou commande de santé accessible.

## Sécurité et données

- [ ] `APP_KEY` unique et stockée hors dépôt.
- [ ] Secrets absents du dépôt et des logs.
- [ ] Access tokens mobiles : expiration, révocation, inactivité.
- [ ] Rate-limit sur la connexion, les codes et les liens publics.
- [ ] Liens publics : hash, expiration, révocation, `last_used_at`.
- [ ] Chiffrement des colonnes sensibles.
- [ ] Transformers en allow-list, aucun modèle brut.
- [ ] Rétention et purge des données personnelles.
- [ ] Base légale, politique de confidentialité et DPA vérifiés avec un compétent.
- [ ] Données de test fictives uniquement.

## Produit et support

- [ ] Utilisateurs du pilote identifiés et formés.
- [ ] Parcours d'accueil et visite guidée vérifiés.
- [ ] Canal de support défini et connu des utilisateurs.
- [ ] Limites connues écrites et partagées.
- [ ] Plan de retour utilisateur (quand, comment, quoi mesurer).
- [ ] Critères de réussite du pilote définis.
- [ ] Plan de correction des défauts bloquants.

## Tests et recette

- [ ] `verify` générique vert.
- [ ] Tests fonctionnels et unitaires verts.
- [ ] Preuve MariaDB sur les migrations et la concurrence.
- [ ] Parcours web vérifié sur ordinateur.
- [ ] Parcours mobile vérifié sur un appareil réel.
- [ ] Accessibilité de base : labels, contraste, cibles tactiles.
- [ ] Performance perçue vérifiée sur les écrans principaux.
- [ ] Sauvegarde/restauration et rollback testés.

## Go / No-go

- [ ] Aucun défaut bloquant ouvert.
- [ ] Les défauts connus sont documentés et acceptés.
- [ ] La personne qui exploite sait où regarder en cas d'incident.
- [ ] La décision de lancement est datée et tracée.
