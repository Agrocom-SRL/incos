import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEnv, getEnvAsNumber } from './env.validator.js';
import { serverConfig } from './server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de logs (relativo a la raíz del proyecto)
const logsDir = path.join(__dirname, '../../../', getEnv('LOG_DIR', 'logs'));

/**
 * Formato personalizado para logs
 */
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Agregar metadata si existe
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }

        // Agregar stack trace si existe
        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

/**
 * Formato para consola (con colores)
 */
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

/**
 * Transports para Winston
 */
const transports = [
    // Console (siempre activo)
    new winston.transports.Console({
        format: consoleFormat,
    }),
];

// File transports (solo en desarrollo y producción)
if (!serverConfig.isTest) {
    // Logs de errores
    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: getEnv('LOG_MAX_SIZE', '20m'),
            maxFiles: getEnvAsNumber('LOG_MAX_FILES', 14) + 'd',
            format: customFormat,
        })
    );

    // Logs combinados
    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: getEnv('LOG_MAX_SIZE', '20m'),
            maxFiles: getEnvAsNumber('LOG_MAX_FILES', 14) + 'd',
            format: customFormat,
        })
    );
}

/**
 * Configuración de Winston Logger
 */
export const loggerConfig = {
    level: getEnv('LOG_LEVEL', serverConfig.isDevelopment ? 'debug' : 'info'),
    format: customFormat,
    transports,
    exitOnError: false,
};

/**
 * Instancia de Logger de Winston
 * 
 * NOTA: Esta es la instancia cruda de Winston. Para código del dominio (Use Cases),
 * se debe usar WinstonLoggerAdapter que implementa ILogger (ver infrastructure/services/WinstonLoggerAdapter.js)
 * 
 * Esta instancia se usa:
 * - Por WinstonLoggerAdapter internamente
 * - Por código de infraestructura/bootstrap que necesita acceso directo a Winston
 * - NO debe usarse en Use Cases (usar el logger del container que implementa ILogger)
 */
export const logger = winston.createLogger(loggerConfig);

/**
 * Stream para Morgan (middleware de HTTP logging)
 */
logger.stream = {
    write: (message) => logger.http(message.trim()),
};

export default logger;