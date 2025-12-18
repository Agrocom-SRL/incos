import 'dotenv/config';
import app from './app.js';
import { logger } from './shared/logger.js';
import { sequelize } from './infrastructure/database/config/sequelize.js';

const PORT = process.env.PORT || 3000;

// Inicializar conexión a la base de datos antes de iniciar el servidor
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('✓ Conexión a la base de datos establecida correctamente');
    
    // Opcional: Verificar que las tablas principales existan
    if (process.env.NODE_ENV !== 'production') {
      const [results] = await sequelize.query("SHOW TABLES LIKE 'gestion'");
      if (results.length === 0) {
        logger.warn('⚠ Advertencia: La tabla "gestion" no existe. Verifica que las migraciones se hayan ejecutado.');
      }
    }
  } catch (error) {
    logger.error('✗ Error al conectar con la base de datos:', {
      message: error.message,
      name: error.name,
      code: error.original?.code,
      sqlState: error.original?.sqlState,
      sqlMessage: error.original?.sqlMessage,
    });
    logger.error('Detalles de conexión:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'instituto_incos',
      user: process.env.DB_USER || 'root',
    });
    process.exit(1);
  }
}

// Variable para almacenar la instancia del servidor
let serverInstance = null;

// Inicializar base de datos y luego iniciar servidor
initializeDatabase()
  .then(() => {
    serverInstance = app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`API: http://localhost:${PORT}/api/v1`);
        logger.info(`Docs: http://localhost:${PORT}/api-docs`);
      }
    });

    // Manejo de errores no capturados
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection - Apagando servidor...', err);
      if (serverInstance) {
        serverInstance.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM recibido - Cerrando servidor gracefully...');
      if (serverInstance) {
        serverInstance.close(async () => {
          logger.info('Cerrando conexión a la base de datos...');
          await sequelize.close();
          logger.info('Servidor cerrado correctamente');
        });
      }
    });

    // Cerrar conexión a la base de datos al salir
    process.on('SIGINT', async () => {
      logger.info('SIGINT recibido - Cerrando servidor gracefully...');
      if (serverInstance) {
        serverInstance.close(async () => {
          logger.info('Cerrando conexión a la base de datos...');
          await sequelize.close();
          logger.info('Servidor cerrado correctamente');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });

    return serverInstance;
  })
  .catch((error) => {
    logger.error('Error fatal al inicializar el servidor:', error);
    process.exit(1);
  });

// Exportar la instancia del servidor (puede ser null si aún no se ha inicializado)
export default serverInstance;
