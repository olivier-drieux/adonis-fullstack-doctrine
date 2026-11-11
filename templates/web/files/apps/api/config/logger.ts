import env from '#start/env'
import { defineConfig } from '@adonisjs/core/logger'

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
        ],
        censor: '[redacted]',
      },
    },
  },
})
