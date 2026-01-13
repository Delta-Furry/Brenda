import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // <--- ESTO ES LA CLAVE. Sin esto, todo se rompe en GitHub.
})