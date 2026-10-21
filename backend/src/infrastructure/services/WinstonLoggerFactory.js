import winston from 'winston';
import { loggerConfig } from '../config/logger.config.js';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter.js';

/**
 * Función privada para crear instancia de Winston Logger (Winston puro)
 *
 * Función interna que no se exporta. Solo se usa para crear la instancia singleton.
 *
 * @returns {winston.Logger} Instancia configurada de Winston
 */
function createWinstonLogger() {
    const logger = winston.createLogger(loggerConfig);

    /**
     * Stream para Morgan (middleware de HTTP logging)
     */
    logger.stream = {
        write: (message) => logger.http(message.trim()),
    };

    return logger;
}

/**
 * Instancia singleton del LoggerAdapter
 *
 * Esta instancia implementa ILogger y se registra en el container
 * para inyección de dependencias en toda la aplicación.
 *
 * Patrón similar a ErrorFormatter.js: exporta instancia singleton directamente.
 *
 * @type {WinstonLoggerAdapter}
 */
const winstonInstance = createWinstonLogger();
export const logger = new WinstonLoggerAdapter(winstonInstance);

export default logger;
