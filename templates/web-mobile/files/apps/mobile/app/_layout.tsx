import { QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { AppProvider } from '@scope/ui'
import { queryClient } from '../src/api/client'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Stack />
      </AppProvider>
    </QueryClientProvider>
  )
}
