import { getEnv, getEnvAsNumber, getEnvAsBoolean } from './env.validator.js';

const nodeEnv = getEnv('NODE_ENV', 'development');

/**
 * Configuración del servidor Express
 */
export const serverConfig = {
    // Puerto
    port: getEnvAsNumber('PORT', 3000),

    // Entorno
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',

    // Trust proxy (para Nginx)
    trustProxy: getEnvAsBoolean('TRUST_PROXY', false),

    // Límites de body
    bodyLimit: '10mb',

    // Rutas
    uploadsPath: getEnv('UPLOAD_DIR', 'uploads'),

    // Aplicación
    appName: getEnv('APP_NAME', 'Sistema INCOS'),
    appUrl: getEnv('APP_URL', 'http://localhost:3000'),
    frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
};

export default serverConfig;