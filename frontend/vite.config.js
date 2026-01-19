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
            '@useCases-estudiantes': path.resolve(__dirname, './src/domain/useCases/estudiantes'),
            '@useCases-configuracion': path.resolve(__dirname, './src/domain/useCases/configuracion'),
            '@useCases-academico': path.resolve(__dirname, './src/domain/useCases/academico'),
            '@repositories': path.resolve(__dirname, './src/domain/repositories'),

            // Application Layer
            '@application': path.resolve(__dirname, './src/application'),
            '@container': path.resolve(__dirname, './src/application/container'),
            '@application-utils': path.resolve(__dirname, './src/application/utils'),
            '@application-navigation': path.resolve(__dirname, './src/application/navigation'),
            // Application Modules
            '@application-estudiantes': path.resolve(__dirname, './src/application/modules/estudiantes'),
            '@application-estudiantes-old': path.resolve(__dirname, './src/application/modules/estudiantes-old'),
            '@application-dashboard': path.resolve(__dirname, './src/application/modules/dashboard'),
            '@application-configuracion': path.resolve(__dirname, './src/application/modules/configuracion'),
            '@application-inscripciones': path.resolve(__dirname, './src/application/modules/inscripciones'),
            '@application-academico': path.resolve(__dirname, './src/application/modules/academico'),
            '@application-auth': path.resolve(__dirname, './src/application/modules/auth'),

            // Infrastructure Layer
            '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
            '@api': path.resolve(__dirname, './src/infrastructure/api'),
            '@api-client': path.resolve(__dirname, './src/infrastructure/api/client.js'),
            '@implementations': path.resolve(__dirname, './src/infrastructure/repositories'),
            '@storage': path.resolve(__dirname, './src/infrastructure/storage'),

            // Presentation Layer
            '@presentation': path.resolve(__dirname, './src/presentation'),
            '@presentation-utils': path.resolve(__dirname, './src/presentation/utils'),
            '@components': path.resolve(__dirname, './src/presentation/components'),
            '@atoms': path.resolve(__dirname, './src/presentation/components/atoms'),
            '@molecules': path.resolve(__dirname, './src/presentation/components/molecules'),
            '@organisms': path.resolve(__dirname, './src/presentation/components/organisms'),
            '@templates': path.resolve(__dirname, './src/presentation/templates'),
            '@pages': path.resolve(__dirname, './src/presentation/pages'),
            '@modules': path.resolve(__dirname, './src/presentation/modules'),

            // Módulos específicos de Presentation
            '@estudiantes': path.resolve(__dirname, './src/presentation/modules/estudiantes'),
            '@estudiantes-old': path.resolve(__dirname, './src/presentation/modules/estudiantes-old'),
            '@dashboard': path.resolve(__dirname, './src/presentation/modules/dashboard'),
            '@configuracion': path.resolve(__dirname, './src/presentation/modules/configuracion'),
            '@calificaciones': path.resolve(__dirname, './src/presentation/modules/calificaciones'),
            '@docentes': path.resolve(__dirname, './src/presentation/modules/docentes'),
            '@gestiones': path.resolve(__dirname, './src/presentation/modules/gestiones'),
            '@historial': path.resolve(__dirname, './src/presentation/modules/historial'),
            '@inscripciones': path.resolve(__dirname, './src/presentation/modules/inscripciones'),
            '@nivelaciones': path.resolve(__dirname, './src/presentation/modules/nivelaciones'),
            '@pagos': path.resolve(__dirname, './src/presentation/modules/pagos'),
            '@reportes': path.resolve(__dirname, './src/presentation/modules/reportes'),
            '@supervision': path.resolve(__dirname, './src/presentation/modules/supervision'),
            '@trazabilidad': path.resolve(__dirname, './src/presentation/modules/trazabilidad'),
            '@usuarios': path.resolve(__dirname, './src/presentation/modules/usuarios'),

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
            '@navigation-guards': path.resolve(__dirname, './src/infrastructure/navigation/guards'),

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