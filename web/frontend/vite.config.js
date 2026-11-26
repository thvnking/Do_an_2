import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:10000';
  return {
    plugins: [react()],
    server: { proxy: { '/api': apiTarget, '/healthz': apiTarget } }
  };
});
