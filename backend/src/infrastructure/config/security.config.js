import { getEnv, getEnvAsBoolean } from './env.validator.js';
import { serverConfig } from './server.config.js';

/**
 * Configuración de seguridad (CORS, Helmet, Rate Limiting)
 */

// Orígenes permitidos para CORS
const allowedOrigins = [
    getEnv('CORS_ORIGIN', 'https://incos.wiiz.com.bo'),
    'https://incos.wiiz.com.bo',
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
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

/**
 * Configuración de Helmet
 */
export const helmetConfig = {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: getEnvAsBoolean('HELMET_ENABLED', true) ? undefined : false,
};

/**
 * Configuración de Rate Limiting
 */
export const rateLimitConfig = {
    windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutos
    max: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
    standardHeaders: true,
    legacyHeaders: false,
};

/**
 * Configuración de Rate Limiting para Login
 */
export const loginRateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: parseInt(getEnv('RATE_LIMIT_LOGIN_MAX', '5'), 10),
    message: 'Demasiados intentos de login, intenta de nuevo más tarde',
    skipSuccessfulRequests: true,
};

export default {
    cors: corsConfig,
    helmet: helmetConfig,
    rateLimit: rateLimitConfig,
    loginRateLimit: loginRateLimitConfig,
};