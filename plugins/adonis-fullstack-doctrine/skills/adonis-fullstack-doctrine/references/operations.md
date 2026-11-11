# Operations

## Sentry

Initialiser Sentry sur les trois surfaces :

- `@sentry/node` côté API ;
- `@sentry/react` côté web ;
- `@sentry/react-native` côté mobile.

```ts
Sentry.init({
  dsn: env.get('SENTRY_DSN'),
  environment: env.get('NODE_ENV'),
  release: env.get('SENTRY_RELEASE'),
  tracesSampleRate: 0.1,
  beforeSend(event) {
    return scrubPii(event)
  },
})
```

Règles :

- un DSN par environnement ;
- release et source maps publiées ;
- jamais de token, cookie, mot de passe, payload brut ou donnée personnelle ;
- `beforeSend` applique la même politique que les logs ;
- les erreurs attendues (401, 404, 422) ne polluent pas Sentry.

## Compose

Référence non normative sur le fournisseur : un VPS unique avec Compose.

```yaml
services:
  api:
    build: .
    env_file: .env
    depends_on:
      mariadb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "ace", "health"]
      interval: 30s
      timeout: 5s
      retries: 3

  mariadb:
    image: mariadb:11
    environment:
      MARIADB_DATABASE: app
      MARIADB_USER: app
      MARIADB_PASSWORD: ${DB_PASSWORD}
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - mariadb:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7
    command: ["redis-server", "--appendonly", "yes", "--maxmemory-policy", "noeviction"]
    volumes:
      - redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - api

volumes:
  mariadb:
  redis:
  caddy_data:
  caddy_config:
```

`Caddyfile` :

```caddyfile
example.com {
  encode zstd gzip
  reverse_proxy api:3333
}
```

Règles :

- health checks réels, pas seulement un port ouvert ;
- volumes persistants pour MariaDB, Redis et Caddy ;
- Redis en `appendonly yes` et `noeviction` ;
- migrations exécutées au déploiement, sérialisées ;
- rollback documenté ;
- secrets hors du dépôt ;
- sauvegarde MariaDB quotidienne, chiffrée, hors site, avec test de restauration.

```bash
mariadb-dump --single-transaction --routines --triggers \
  -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_DATABASE" \
  | gzip > "backup-$(date +%F).sql.gz"
```

## Logs

Le logger AdonisJS est le seul chemin de log.

```ts
// config/logger.ts
export default defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      level: env.get('LOG_LEVEL', 'info'),
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'password',
          'token',
          'secret',
          '*.email',
          '*.phone',
        ],
        censor: '[redacted]',
      },
    },
  },
})
```

Interdits :

- `logger.info(request.body())` ;
- `logger.info(request.all())` ;
- un payload fournisseur brut ;
- un token, un hash de mot de passe ou une clé dans un message d'erreur ;
- `console.log` en production.

Logger un `userId`, un identifiant de ressource ou un hash de token, jamais la valeur.

## Déploiement

1. build web ;
2. build API ;
3. migrations ;
4. health check ;
5. bascule Caddy ;
6. vérification Sentry et logs ;
7. rollback si le health check échoue.

Le déploiement ne dépend pas d'une CI hosted : les gates locaux font foi.
