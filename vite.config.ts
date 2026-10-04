import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 상대 경로로 빌드해 GitHub Pages의 하위 경로에서도 그대로 동작한다
  base: './',
  plugins: [react()],
  server: { port: 5180, strictPort: true },
});
