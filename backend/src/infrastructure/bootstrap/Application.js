import { logger } from '../config/logger.config.js';
import { serverConfig } from '../config/server.config.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Clase de aplicación
 * 
 * Responsabilidades:
 * - Inicializar base de datos
 * - Iniciar servidor HTTP
 * - Manejar shutdown graceful
 * - Gestionar el ciclo de vida de la aplicación
 */
export class Application {
    constructor() {
        this.server = null;
    }

    /**
     * Inicializar la aplicación
     */
    async initialize() {
        try {
            logger.info('Iniciando aplicación Instituto INCOS...');

            await this.connectDatabase();
            this.setupGracefulShutdown();

            logger.info('Aplicación inicializada correctamente');
        } catch (error) {
            logger.error('Error al inicializar aplicación:', error);
            throw error;
        }
    }

    /**
     * Conectar a la base de datos
     */
    async connectDatabase() {
        try {
            await sequelize.authenticate();
            logger.info('Base de datos conectada');

        } catch (error) {
            logger.error('Error de conexión a la base de datos:', {
                message: error.message,
                code: error.original?.code,
                sqlState: error.original?.sqlState,
            });

            logger.error('Detalles de conexión:', {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
            });

            throw error;
        }
    }

    /**
     * Iniciar el servidor HTTP
     */
    start(app) {
        const { port } = serverConfig;

        this.server = app.listen(port, () => {
            logger.info('');
            logger.info('═══════════════════════════════════════════');
            logger.info('  Instituto INCOS - Sistema Académico');
            logger.info('═══════════════════════════════════════════');
            logger.info(`  Servidor: http://localhost:${port}`);

            if (serverConfig.isDevelopment) {
                logger.info(`  API:      http://localhost:${port}/api/v1`);
                logger.info(`  Docs:     http://localhost:${port}/api-docs`);
                logger.info(`  Health:   http://localhost:${port}/health`);
            }

            logger.info(`  Entorno:  ${serverConfig.nodeEnv}`);
            logger.info('═══════════════════════════════════════════');
            logger.info('');
        });

        // Manejar errores del servidor
        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Puerto ${port} ya está en uso`);
            } else {
                logger.error('Error del servidor:', error);
            }
            process.exit(1);
        });

        return this.server;
    }

    /**
     * Configurar apagado graceful
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger.info('');
            logger.info(`${signal} recibido - Cerrando servidor...`);

            if (this.server) {
                this.server.close(async () => {
                    logger.info('Servidor HTTP cerrado');

                    try {
                        await sequelize.close();
                        logger.info('Base de datos cerrada');
                        logger.info('Aplicación cerrada correctamente');
                        process.exit(0);
                    } catch (error) {
                        logger.error('Error al cerrar:', error);
                        process.exit(1);
                    }
                });

                // Timeout de 10 segundos
                setTimeout(() => {
                    logger.error('Forzando cierre (timeout)');
                    process.exit(1);
                }, 10000);
            } else {
                process.exit(0);
            }
        };

        // Señales
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Errores no capturados
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', { reason, promise });
            shutdown('UNHANDLED_REJECTION');
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });
    }
}

export default Application;