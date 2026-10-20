import container from '../container/index.js';
import { SERVICIOS_TOKENS } from '../container/tokens/index.js';
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
        // Obtener logger del container (DI)
        this.logger = container.resolve(SERVICIOS_TOKENS.logger);
    }

    /**
     * Inicializar la aplicación
     */
    async initialize() {
        try {
            this.logger.info('Iniciando aplicación Instituto INCOS...');

            await this.connectDatabase();
            this.setupGracefulShutdown();

            this.logger.info('Aplicación inicializada correctamente');
        } catch (error) {
            this.logger.error('Error al inicializar aplicación:', error);
            throw error;
        }
    }

    /**
     * Conectar a la base de datos
     */
    async connectDatabase() {
        try {
            await sequelize.authenticate();
            this.logger.info('Base de datos conectada');
        } catch (error) {
            this.logger.error('Error de conexión a la base de datos:', {
                message: error.message,
                code: error.original?.code,
                sqlState: error.original?.sqlState,
            });

            this.logger.error('Detalles de conexión:', {
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
            this.logger.info('');
            this.logger.info('═══════════════════════════════════════════');
            this.logger.info('  Instituto INCOS - Sistema Académico');
            this.logger.info('═══════════════════════════════════════════');
            this.logger.info(`  Servidor: http://localhost:${port}`);

            if (serverConfig.isDevelopment) {
                this.logger.info(`  API:      http://localhost:${port}/api/v1`);
                this.logger.info(`  Docs:     http://localhost:${port}/api-docs`);
                this.logger.info(`  Health:   http://localhost:${port}/health`);
            }

            this.logger.info(`  Entorno:  ${serverConfig.nodeEnv}`);
            this.logger.info('═══════════════════════════════════════════');
            this.logger.info('');
        });

        // Manejar errores del servidor
        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                this.logger.error(`Puerto ${port} ya está en uso`);
            } else {
                this.logger.error('Error del servidor:', error);
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
            this.logger.info('');
            this.logger.info(`${signal} recibido - Cerrando servidor...`);

            if (this.server) {
                this.server.close(async () => {
                    this.logger.info('Servidor HTTP cerrado');

                    try {
                        await sequelize.close();
                        this.logger.info('Base de datos cerrada');
                        this.logger.info('Aplicación cerrada correctamente');
                        process.exit(0);
                    } catch (error) {
                        this.logger.error('Error al cerrar:', error);
                        process.exit(1);
                    }
                });

                // Timeout de 10 segundos
                setTimeout(() => {
                    this.logger.error('Forzando cierre (timeout)');
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
            this.logger.error('Unhandled Rejection:', { reason, promise });
            shutdown('UNHANDLED_REJECTION');
        });

        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });
    }
}

export default Application;
