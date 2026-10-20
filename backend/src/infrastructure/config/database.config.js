import { getEnv, getEnvAsNumber } from './env.validator.js';

const nodeEnv = getEnv('NODE_ENV', 'development');

/**
 * Nombre de la base de datos
 * Sincronizado con scripts SQL en database/
 */
const DATABASE_NAME = 'instituto_incos';

/**
 * Configuración de base de datos
 * Sincronizada con:
 * - database/00-config/database-config.sql (charset, collation, timezone)
 * - database/01-schemas/01-base.sql (estructura estándar de tablas)
 * - .env (variables de entorno)
 */
export const databaseConfig = {
    // Credenciales
    username: getEnv('DB_USER', 'root'),
    password: getEnv('DB_PASSWORD', ''),
    database: getEnv('DB_NAME', DATABASE_NAME),
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnvAsNumber('DB_PORT', 8889),
    dialect: 'mysql',

    // Timezone: Bolivia (UTC-4) - debe coincidir con database-config.sql
    timezone: '-04:00',

    // Logging: configurado donde se use (sequelize.js)
    // Retorna false por defecto, el logging se configura en sequelize.js usando el logger
    logging: false,

    // Pool de conexiones (no usar en tests)
    pool:
        nodeEnv !== 'test'
            ? {
                max: getEnvAsNumber('DB_POOL_MAX', 20),
                min: getEnvAsNumber('DB_POOL_MIN', 5),
                acquire: getEnvAsNumber('DB_POOL_ACQUIRE', 30000),
                idle: getEnvAsNumber('DB_POOL_IDLE', 10000),
            }
            : undefined,

    // Configuración de modelos Sequelize
    // Debe coincidir con la configuración en database-config.sql:
    // - charset: utf8mb4
    // - collation: utf8mb4_unicode_ci
    define: {
        timestamps: true, // created_at, updated_at (estándar en todas las tablas)
        underscored: true, // snake_case para nombres de columnas
        freezeTableName: true, // No pluralizar nombres de tablas
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
};
