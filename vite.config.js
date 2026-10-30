import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the built site also works on GitHub Pages or any sub-folder.
  base: './',
  server: { port: 5173, open: true },
  preview: { port: 4173, open: true },
  build: { outDir: 'dist', emptyOutDir: true },
});
