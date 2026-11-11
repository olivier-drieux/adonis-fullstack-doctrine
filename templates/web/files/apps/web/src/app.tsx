import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@scope/ui'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
    return pages[`./pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AppProvider>
        <App {...props} />
      </AppProvider>,
    )
  },
})
