import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const normalizePublicUrl = (value) => {
  if (!value || value === '/') {
    return '';
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, workspaceRoot, '');
  const publicUrl = normalizePublicUrl(loadedEnv.PUBLIC_URL);
  const clientEnv = Object.fromEntries(
    Object.entries(loadedEnv).filter(([key]) => key.startsWith('REACT_APP_')),
  );

  const safeProcessEnv = {
    ...clientEnv,
    NODE_ENV: mode,
    PUBLIC_URL: publicUrl,
  };

  return {
    plugins: [react()],
    envDir: workspaceRoot,
    envPrefix: ['VITE_', 'REACT_APP_'],
    base: publicUrl ? `${publicUrl}/` : '/',
    define: {
      'process.env': JSON.stringify(safeProcessEnv),
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/health': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.join(workspaceRoot, 'build'),
      emptyOutDir: true,
      sourcemap: process.env.GENERATE_SOURCEMAP !== 'false',
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[name].[hash].js',
          chunkFileNames: 'static/js/[name].[hash].js',
          assetFileNames: ({ name }) => {
            const ext = path.extname(name || '').toLowerCase();

            if (ext === '.css') {
              return 'static/css/[name].[hash][extname]';
            }

            return 'static/media/[name].[hash][extname]';
          },
        },
      },
    },
  };
});
