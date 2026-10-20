import { Sequelize } from 'sequelize';
import { databaseConfig } from '../config/database.config.js';
import { serverConfig } from '../config/server.config.js';
import { getEnvAsBoolean } from '../config/env.validator.js';
import { logger } from '../services/WinstonLoggerFactory.js';

/**
 * Instancia única de Sequelize
 *
 * Usa configuración centralizada y logger singleton (no puede usar container
 * aquí por dependencia circular: sequelize se importa antes de que el container esté listo).
 * Esta es la ÚNICA instancia de conexión a la base de datos en toda la aplicación
 *
 * Usa la misma instancia singleton que el container para consistencia.
 */

export const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    {
        host: databaseConfig.host,
        port: databaseConfig.port,
        dialect: databaseConfig.dialect,
        // Configurar logging usando factory function de logger
        logging:
            serverConfig.isDevelopment && getEnvAsBoolean('DB_LOGGING', false)
                ? (msg) => logger.debug(msg)
                : false,
        dialectOptions: databaseConfig.dialectOptions,
        timezone: databaseConfig.timezone,
        pool: databaseConfig.pool,
        define: databaseConfig.define,
    }
);

export default sequelize;
