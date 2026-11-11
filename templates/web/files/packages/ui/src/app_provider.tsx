import { TamaguiProvider, Theme } from 'tamagui'
import config from './tamagui.config'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <Theme name="light">{children}</Theme>
    </TamaguiProvider>
  )
}
