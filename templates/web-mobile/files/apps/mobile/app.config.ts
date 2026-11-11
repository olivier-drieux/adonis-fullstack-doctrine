import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'my-app',
  slug: 'my-app',
  scheme: 'myapp',
  experiments: { typedRoutes: true },
})
