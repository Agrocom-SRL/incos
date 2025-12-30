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
            '@domain': path.resolve(__dirname, './src/domain'),
            '@useCases': path.resolve(__dirname, './src/domain/useCases'),
            '@repositories': path.resolve(__dirname, './src/domain/repositories'),

            // Application Layer
            '@application': path.resolve(__dirname, './src/application'),
            '@container': path.resolve(__dirname, './src/application/container'),
            '@application-estudiantes': path.resolve(__dirname, './src/application/modules/estudiantes'),
            '@application-dashboard': path.resolve(__dirname, './src/application/modules/dashboard'),
            '@application-navigation': path.resolve(__dirname, './src/application/navigation'),

            // Infrastructure Layer
            '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
            '@api': path.resolve(__dirname, './src/infrastructure/api'),
            '@api-client': path.resolve(__dirname, './src/infrastructure/api/client.js'),
            '@implementations': path.resolve(__dirname, './src/infrastructure/repositories'),
            '@storage': path.resolve(__dirname, './src/infrastructure/storage'),

            // Presentation Layer
            '@presentation': path.resolve(__dirname, './src/presentation'),
            '@components': path.resolve(__dirname, './src/presentation/components'),
            '@atoms': path.resolve(__dirname, './src/presentation/components/atoms'),
            '@molecules': path.resolve(__dirname, './src/presentation/components/molecules'),
            '@organisms': path.resolve(__dirname, './src/presentation/components/organisms'),
            '@templates': path.resolve(__dirname, './src/presentation/templates'),
            '@pages': path.resolve(__dirname, './src/presentation/pages'),
            '@modules': path.resolve(__dirname, './src/presentation/modules'),

            // Módulos específicos
            '@estudiantes': path.resolve(__dirname, './src/presentation/modules/estudiantes'),
            '@estudiantes-old': path.resolve(__dirname, './src/presentation/modules/estudiantes-old'),
            '@dashboard': path.resolve(__dirname, './src/presentation/modules/dashboard'),

            // Configuración
            '@config': path.resolve(__dirname, './src/infrastructure/config'),

            // Rutas (alias para compatibilidad - ahora apunta a modules/index.js)
            '@routes': path.resolve(__dirname, './src/presentation/modules'),
            // Router Components (Presentation)
            '@components-router': path.resolve(__dirname, './src/presentation/components/router'),

            // Navegación (Infrastructure)
            '@navigation': path.resolve(__dirname, './src/infrastructure/navigation'),
            '@navigation-services': path.resolve(__dirname, './src/infrastructure/navigation/services'),
            '@navigation-router': path.resolve(__dirname, './src/infrastructure/navigation/router'),

            // Theme
            '@theme': path.resolve(__dirname, './src/infrastructure/config/theme'),

            // Layout Components
            '@assets': path.resolve(__dirname, './src/presentation/assets'),
            '@styles': path.resolve(__dirname, './src/presentation/styles'),
        },
    },

    server: {
        port: 5173,
        open: true,
        proxy: {
            // Proxy para archivos de uploads (documentos, fotos)
            '/uploads': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
            // Proxy para la API (ya configurado en apiClient, pero por si acaso)
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});