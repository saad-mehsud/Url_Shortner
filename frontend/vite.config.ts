import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function fixHashPathPlugin(): Plugin {
  const root = process.cwd();
  return {
    name: 'fix-hash-path',
    enforce: 'pre',
    resolveId(source, importer) {
      let target = '';
      if (source.startsWith('/')) {
        target = path.join(root, source);
      } else if (importer && (source.startsWith('./') || source.startsWith('../'))) {
        target = path.resolve(path.dirname(importer.split('?')[0]), source);
      }

      if (target) {
        const candidates = [
          target,
          `${target}.tsx`,
          `${target}.ts`,
          `${target}.jsx`,
          `${target}.js`,
          path.join(target, 'index.tsx'),
          path.join(target, 'index.ts'),
          path.join(target, 'index.jsx'),
          path.join(target, 'index.js'),
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
          }
        }
      }
      return null;
    },
    load(id) {
      const cleanPath = id.split('?')[0];
      if (cleanPath && cleanPath.includes('/C#/') && fs.existsSync(cleanPath) && fs.statSync(cleanPath).isFile()) {
        return fs.readFileSync(cleanPath, 'utf8');
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
