# Protection des données

## PII

Inventorier les données personnelles par modèle et par migration :

- identité (nom, email, téléphone, adresse) ;
- identifiants (SSN, numéro fiscal, IBAN) ;
- contenu sensible (santé, juridique, financier) ;
- tokens et secrets.

Règles :

- chiffrer les colonnes sensibles avec le service `encryption` d'AdonisJS ;
- ne jamais exposer un modèle brut ;
- le transformer applique une allow-list ;
- une surface plus sensible reçoit un transformer plus étroit ;
- les logs n'écrivent jamais la valeur, seulement un identifiant ou un hash ;
- les exports, webhooks et liens publics sont des surfaces de fuite à part entière.

```ts
import encryption from '@adonisjs/core/services/encryption'

const cipher = encryption.encrypt(phone)
const clear = encryption.decrypt(cipher)
```

## Tenancy

Si le produit parle de plusieurs opérateurs, espaces, cabinets ou organisations :

- ajouter un `tenant_id` réel sur les modèles ;
- filtrer par tenant dans les policies, services, jobs, exports et logs ;
- tester l'accès croisé ;
- ne pas considérer un accès admin authentifié comme une frontière.

Un contrôle global « admin » n'est pas un tenant. Une requête qui oublie le filtre doit échouer, pas retourner les données d'un autre.

## Retention

Chaque store durable a :

- une finalité ;
- une durée ou une exception documentée ;
- une purge ou anonymisation ;
- un test de purge ;
- une trace de la dernière exécution.

Stores concernés : audits, historiques, notifications, ledgers, tokens, fichiers, exports, logs applicatifs.

Ne pas conserver un payload brut « pour déboguer ». Conserver des identifiants, des statuts, des horodatages et des hashes.

## Public tokens

Voir [auth.md](auth.md#public-tokens). Un token public est un bearer credential :

- hash en base ;
- expiration ;
- révocation ;
- rate-limit ;
- audit `last_used_at` ;
- pas de rebinding silencieux.

## Données de test

- Toujours fictives.
- Jamais de données de production dans un dépôt, un fixture ou une capture.
- Les captures d'écran sont relues avant d'être partagées.
- Les seeds utilisent des noms et adresses manifestement fictifs.

## Base légale et durées

La doctrine ne fixe pas la base légale ni les durées. Chaque projet documente ses traitements, leurs finalités, leurs bases légales et leurs durées avec une validation juridique compétente.
