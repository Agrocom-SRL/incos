// Validar entorno primero
import { validateEnv } from './env.validator.js';
validateEnv();

// Exportar todas las configuraciones
export { databaseConfig } from './database.config.js';
export { serverConfig } from './server.config.js';
export {
    corsConfig,
    helmetConfig,
    rateLimitConfig,
    loginRateLimitConfig
} from './security.config.js';
export { logger, loggerConfig } from './logger.config.js';
export { uploadConfig } from './upload.config.js';

// Export por defecto con todas las configs
import { databaseConfig } from './database.config.js';
import { serverConfig } from './server.config.js';
import securityConfig from './security.config.js';
import { logger } from './logger.config.js';
import { uploadConfig } from './upload.config.js';

export const config = {
    database: databaseConfig,
    server: serverConfig,
    security: securityConfig,
    upload: uploadConfig,
    logger,
};

export default config;