import { Sequelize } from 'sequelize';
import databaseConfig from '../../config/database.js';

/**
 * Instancia de Sequelize
 * 
 * Usa la configuración centralizada de config/database.js
 * Esta es la única instancia de conexión a la base de datos en toda la aplicación
 * 
 * @see config/database.js - Configuración de la base de datos
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
