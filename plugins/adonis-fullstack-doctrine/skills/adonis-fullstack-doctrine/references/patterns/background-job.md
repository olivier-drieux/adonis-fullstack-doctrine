# Pattern — Background job

## Déclenchement

Le job est dispatché après le commit de la transaction qui revendique la ligne.

```ts
await db.transaction(async (trx) => {
  const invitation = await Invitation.query({ client: trx })
    .where('id', id)
    .forUpdate()
    .firstOrFail()

  if (invitation.sentAt) return

  invitation.claimedAt = DateTime.now()
  await invitation.save()

  await SendInvitationEmail.dispatch(invitation.id).afterCommit()
})
```

## Job

```ts
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

## Règles

- payload = identifiants seulement ;
- recharger l'état courant ;
- idempotence : vérifier `sentAt`, `status`, `version` ;
- erreur transiente : re-throw ;
- erreur permanente : terminal, pas de retry infini ;
- timeout borné ;
- annulation propagée ;
- log redacted.

## Scheduled work

```ts
export default class PurgeExpiredInvitations extends BaseJob {
  static options = {
    queue: 'maintenance',
    repeat: { cron: '0 3 * * *', tz: 'Europe/Paris' },
  }

  async execute() {
    await Invitation.query().where('expires_at', '<', DateTime.now()).delete()
  }
}
```

- fuseau explicite ;
- rattrapage borné ;
- heartbeat séparé ;
- horloge contrôlée dans les tests.

## Tests

- exécution nominale ;
- rejeu sans double effet ;
- erreur transiente puis succès ;
- erreur permanente ;
- timeout ;
- annulation ;
- reprise après redémarrage ;
- profondeur de queue et health check.
