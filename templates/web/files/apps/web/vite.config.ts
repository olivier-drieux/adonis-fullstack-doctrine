import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    react(),
    adonisjs({
      entryPoints: ['src/app.tsx'],
      buildDirectory: resolve(import.meta.dirname, '../api/public/assets'),
    }),
  ],
  resolve: {
    alias: [{ find: '~/', replacement: `${import.meta.dirname}/src/` }],
    dedupe: ['react', 'react-dom', 'react-native-web'],
  },
  define: {
    'process.env.TAMAGUI_TARGET': JSON.stringify('web'),
  },
})
