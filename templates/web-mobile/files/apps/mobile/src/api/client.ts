import { createTuyau } from '@tuyau/core/client'
import { createTuyauReactQueryClient } from '@tuyau/react-query'
import { QueryClient } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'
import { registry } from '@scope/api-client/registry'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
})

const client = createTuyau({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  registry,
  hooks: {
    beforeRequest: async (request) => {
      const token = await SecureStore.getItemAsync('auth.token')
      if (token) request.headers.set('Authorization', `Bearer ${token}`)
    },
  },
})

export const api = createTuyauReactQueryClient({ client, queryClient })
