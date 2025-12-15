import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Domain Layer
      '@core': path.resolve(__dirname, './src/core'),
      '@entities': path.resolve(__dirname, './src/core/entities'),
      '@useCases': path.resolve(__dirname, './src/core/useCases'),
      '@repositories': path.resolve(__dirname, './src/core/repositories'),

      // Application Layer
      '@application': path.resolve(__dirname, './src/application'),
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@store': path.resolve(__dirname, './src/application/store'),
      '@providers': path.resolve(__dirname, './src/application/providers'),

      // Infrastructure Layer
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@repo-impl': path.resolve(__dirname, './src/infrastructure/repositories'),
      '@storage': path.resolve(__dirname, './src/infrastructure/storage'),

      // Presentation Layer
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@atoms': path.resolve(__dirname, './src/presentation/components/atoms'),
      '@molecules': path.resolve(__dirname, './src/presentation/components/molecules'),
      '@organisms': path.resolve(__dirname, './src/presentation/components/organisms'),
      '@templates': path.resolve(__dirname, './src/presentation/templates'),
      '@pages': path.resolve(__dirname, './src/presentation/pages'),
      '@modules': path.resolve(__dirname, './src/presentation/modules'),
      // Módulos específicos (para evitar rutas relativas)
      '@estudiantes': path.resolve(__dirname, './src/presentation/modules/estudiantes'),

      // Shared
      '@shared': path.resolve(__dirname, './src/shared'),
      '@constants': path.resolve(__dirname, './src/shared/constants'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),
      '@config': path.resolve(__dirname, './src/infrastructure/config'),

      // Router
      '@router': path.resolve(__dirname, './src/router'),
      '@router-config': path.resolve(__dirname, './src/router/config'),
      '@router-utils': path.resolve(__dirname, './src/router/utils'),
      
      // Theme
      '@theme': path.resolve(__dirname, './src/infrastructure/config/theme'),
      
      // Layout Components
      '@layout-components': path.resolve(__dirname, './src/presentation/templates/MainLayout/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});