import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development'

  return {
    build: {
      sourcemap: 'hidden',
    },
    plugins: [
      react({
        babel: isDev
          ? {
            plugins: ['react-dev-locator'],
          }
          : {},
      }),
      tsconfigPaths(),
    ],
  }
})
