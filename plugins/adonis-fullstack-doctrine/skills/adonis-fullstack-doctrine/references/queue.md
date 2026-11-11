# Queue

## Redis

`@adonisjs/queue` avec le driver Redis, en développement, test d'intégration et production.

```ts
// config/queue.ts
import env from '#start/env'
import { defineConfig } from '@adonisjs/queue'

export default defineConfig({
  default: 'redis',
  connections: {
    redis: {
      driver: 'redis',
      connection: {
        host: env.get('REDIS_HOST'),
        port: env.get('REDIS_PORT'),
        password: env.get('REDIS_PASSWORD'),
      },
    },
  },
})
```

`sync` est réservé aux tests unitaires. Un test d'intégration de job utilise Redis réel ou un faux Redis compatible, pas `sync`.

Exploitation Redis :

- service dédié dans Compose ;
- `appendonly yes` pour la durabilité ;
- politique de mémoire explicite (`noeviction` pour une queue) ;
- health check `redis-cli ping` ;
- pas de données personnelles dans les payloads ;
- surveillance de la profondeur de queue et des jobs en échec.

## Idempotency

Un job peut être rejoué. Il doit produire le même résultat.

- Clé d'idempotence stable : `job:<type>:<resource>:<version>`.
- Vérifier l'état avant l'effet : ne pas renvoyer un email déjà envoyé.
- Claim atomique : `UPDATE ... WHERE status = 'PENDING'` puis agir seulement si la ligne a été revendiquée.
- Distinguer erreur transiente (5xx, timeout) et permanente (format invalide).
- Ne pas brûler le budget de retry sur une erreur permanente.
- Dispatch après le commit de la transaction qui revendique la ligne.

## Jobs

```ts
import { BaseJob } from '@adonisjs/queue'

export default class SendInvitationEmail extends BaseJob {
  static options = {
    queue: 'mail',
    tries: 5,
    backoff: [1000, 5000, 15000, 60000, 300000],
    timeout: 30000,
  }

  constructor(private invitationId: string) {
    super()
  }

  async execute() {
    const invitation = await Invitation.findOrFail(this.invitationId)
    if (invitation.sentAt) return
    await Mail.send(new InvitationMail(invitation))
    invitation.sentAt = DateTime.now()
    await invitation.save()
  }
}
```

- Le payload ne contient que des identifiants, jamais un modèle sérialisé.
- Le job recharge l'état courant.
- Les jobs longs propagent l'annulation et laissent un temps de nettoyage borné.
- Les jobs récurrents déclarent leur fuseau, leur calendrier, leur ancre et leur politique de rattrapage.

## Scheduled work

- Fuseau explicite.
- Mois courts et changements d'heure testés.
- Rattrapage borné : ne pas rejouer dix jours de jobs d'un coup.
- Heartbeat du scheduler séparé du succès métier.
- Une horloge contrôlée dans les tests.

## Tests

- Test unitaire du job avec `sync` et un état préparé.
- Test d'intégration avec Redis réel : dispatch, retry, idempotence, échec permanent.
- Test de la profondeur de queue et du health check.
- Test de la reprise après redémarrage.
