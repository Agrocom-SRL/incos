import { getEnv, getEnvAsBoolean } from './env.validator.js';
import { serverConfig } from './server.config.js';

/**
 * Configuración de seguridad (CORS, Helmet)
 */

// Orígenes permitidos para CORS
const allowedOrigins = [
    getEnv('CORS_ORIGIN', 'https://sistema.incos-santacruz.edu.bo'),
    'https://sistema.incos-santacruz.edu.bo',
    'http://localhost:5173',
    'http://localhost:3000',
];

/**
 * Configuración de CORS
 */
export const corsConfig = {
    origin: (origin, callback) => {
        // Permitir requests sin origen (Postman, curl, navegador directo)
        if (!origin) {
            return callback(null, true);
        }

        // Verificar si el origen está en la lista
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // En desarrollo, permitir cualquier origen
        if (serverConfig.isDevelopment) {
            return callback(null, true);
        }

        // En producción, bloquear
        callback(new Error('No permitido por CORS'));
    },
    credentials: getEnvAsBoolean('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    // Necesario para descargas (leer filename en Content-Disposition desde el frontend)
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Disposition', 'Content-Type'],
};

/**
 * Configuración de Helmet
 */
export const helmetConfig = {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: getEnvAsBoolean('HELMET_ENABLED', true) ? undefined : false,
};
