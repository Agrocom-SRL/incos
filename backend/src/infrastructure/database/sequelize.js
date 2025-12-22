import { Sequelize } from 'sequelize';
import { databaseConfig } from '../config/database.config.js';
import { logger } from '../config/logger.config.js';

/**
 * Instancia única de Sequelize
 * 
 * Usa la configuración centralizada de infrastructure/config/database.config.js
 * Esta es la ÚNICA instancia de conexión a la base de datos en toda la aplicación
 */
export const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    {
        host: databaseConfig.host,
        port: databaseConfig.port,
        dialect: databaseConfig.dialect,
        logging: databaseConfig.logging,
        timezone: databaseConfig.timezone,
        pool: databaseConfig.pool,
        define: databaseConfig.define,
    }
);

export default sequelize;