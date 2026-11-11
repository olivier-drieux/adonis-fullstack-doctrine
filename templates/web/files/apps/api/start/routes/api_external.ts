import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router
  .group(() => {
    router.get('/health', [controllers.Health, 'index']).as('api_external.health')
  })
  .prefix('/api')
