import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is set to the repository name so assets resolve correctly when
// hosted at https://asheets1.github.io/Project1/
export default defineConfig({
  base: '/Project1/',
  plugins: [react()],
})
