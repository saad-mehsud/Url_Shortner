import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function fixHashPathPlugin(): Plugin {
  return {
    name: 'fix-hash-path',
    enforce: 'pre',
    resolveId(source, importer) {
      if (importer && (source.startsWith('./') || source.startsWith('../') || source.startsWith('/'))) {
        const importerDir = path.dirname(importer.split('?')[0]);
        const targetPath = path.resolve(importerDir, source);

        const candidates = [
          targetPath,
          `${targetPath}.tsx`,
          `${targetPath}.ts`,
          `${targetPath}.jsx`,
          `${targetPath}.js`,
          path.join(targetPath, 'index.tsx'),
          path.join(targetPath, 'index.ts'),
          path.join(targetPath, 'index.jsx'),
          path.join(targetPath, 'index.js'),
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
          }
        }
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [fixHashPathPlugin(), react()],
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5216',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5216',
        changeOrigin: true,
        secure: false,
      },
      '/scalar': {
        target: 'http://localhost:5216',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
