import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Alias de capas — arquitectura feature-based limpia.
 * @ds   design-system (tokens + theme)   ·  @ui   átomos/moléculas/organismos/templates
 * @config configuración (brand/tenant)   ·  @features  features por dominio
 * @mocks datos mock (contrato = backend) ·  @lib  utilidades transversales (i18n, motion, hooks)
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ds': path.resolve(__dirname, './src/design-system'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@config': path.resolve(__dirname, './src/config'),
      '@features': path.resolve(__dirname, './src/features'),
      '@mocks': path.resolve(__dirname, './src/mocks'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
