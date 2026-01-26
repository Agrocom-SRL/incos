import { getEnv, getEnvAsNumber, getEnvAsBoolean } from './env.validator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const nodeEnv = getEnv('NODE_ENV', 'development');

// Obtener ruta base del backend (desde este archivo: config/ -> infrastructure/ -> src/ -> backend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '../../..');

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
    backendRoot: BACKEND_ROOT, // Ruta base del backend para resolver rutas relativas

    // Aplicación
    appName: getEnv('APP_NAME', 'Sistema INCOS'),
    appUrl: getEnv('APP_URL', 'http://localhost:3000'),
    frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
};