import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    entry: 'src/main/main.ts'
  },
  preload: {
    input: 'src/preload/preload.ts'
  },
  renderer: {
    input: 'src/renderer/index.html',
    plugins: [react()]
  }
});
