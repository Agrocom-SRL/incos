import 'dotenv/config';

/**
 * Configuración de base de datos
 * 
 * Actualmente: 'instituto_incos' (definido en todos los scripts SQL)
 * 
 * Las variables de entorno (.env) tienen prioridad sobre los valores por defecto.
 */
const env = process.env.NODE_ENV || 'development';

/**
 * Nombre de la base de datos
 * Debe coincidir con el nombre usado en los scripts SQL
 * @see database/00-config/database-config.sql
 */
const DATABASE_NAME = 'instituto_incos';

/**
 * Configuración única de base de datos
 * Sincronizada con:
 * - database/00-config/database-config.sql (charset, collation, timezone)
 * - database/01-schemas/01-base.sql (estructura estándar de tablas)
 * - .env (variables de entorno)
 */
const databaseConfig = {
  // Credenciales (desde .env)
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || DATABASE_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 8889,
  dialect: 'mysql',
  
  // Timezone: Bolivia (UTC-4) - debe coincidir con database-config.sql
  timezone: '-04:00',
  
  // Logging: solo en development si DB_LOGGING está habilitado
  logging: env === 'development' && process.env.DB_LOGGING === 'true' 
    ? console.log 
    : false,
  
  // Pool de conexiones (solo en development y production)
  ...(env !== 'test' && {
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
  }),
  
  // Configuración de Sequelize
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

export default databaseConfig;
