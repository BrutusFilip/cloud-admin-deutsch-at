import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' keeps every asset path relative, so the build works on GitHub Pages
// under any repository name (https://<account>.github.io/<repo>/), at a domain
// root and from any static web server (not from file://). Routes live in the URL hash, so a reload
// of any view requests only index.html. This is the one place for the base path: only a switch to
// path-based routes would need an absolute base ('/<repo>/') here and a 404.html fallback.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // React in its own chunk: it changes rarely and stays cached across content updates.
        codeSplitting: {
          groups: [{ name: 'vendor', test: /node_modules/ }],
        },
      },
    },
  },
})
