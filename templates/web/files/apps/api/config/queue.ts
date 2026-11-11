import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/queue'

export default defineConfig({
  default: 'redis',
  connections: {
    redis: drivers.redis({
      connection: {
        host: env.get('REDIS_HOST'),
        port: env.get('REDIS_PORT'),
      },
    }),
  },
})
