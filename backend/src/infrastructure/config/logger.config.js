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
            // Serializar metadata de forma más legible
            try {
                const metaString = JSON.stringify(meta, null, 2);
                log += `\n${metaString}`;
            } catch (jsonError) {
                // Si falla la serialización, intentar mostrar propiedades principales
                const safeMeta = {};
                for (const [key, value] of Object.entries(meta)) {
                    try {
                        if (typeof value === 'object' && value !== null) {
                            // Para objetos, intentar serializar solo propiedades serializables
                            safeMeta[key] = value.toString ? value.toString() : '[Object]';
                        } else {
                            safeMeta[key] = value;
                        }
                    } catch (e) {
                        safeMeta[key] = '[Error serializing]';
                    }
                }
                log += ` ${JSON.stringify(safeMeta, null, 2)}`;
            }
        }

        // Agregar stack trace si existe (puede venir de meta.stack o del error)
        const errorStack = stack || meta.stack;
        if (errorStack) {
            log += `\nStack Trace:\n${errorStack}`;
        }

        return log;
    })
);

/**
 * Formato para consola (con colores y detalles)
 */
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} ${level}: ${message}`;

        // Agregar metadata si existe (solo en niveles error y warn para no saturar consola)
        if ((level.includes('error') || level.includes('warn')) && Object.keys(meta).length > 0) {
            // Mostrar solo propiedades importantes en consola
            const importantProps = ['error', 'errorName', 'stack', 'studentId', 'paymentId'];
            const filteredMeta = {};
            for (const key of importantProps) {
                if (meta[key] !== undefined) {
                    filteredMeta[key] = meta[key];
                }
            }
            
            // Si hay otras propiedades, agregarlas también
            for (const [key, value] of Object.entries(meta)) {
                if (!importantProps.includes(key) && value !== undefined) {
                    filteredMeta[key] = value;
                }
            }

            if (Object.keys(filteredMeta).length > 0) {
                try {
                    log += `\n${JSON.stringify(filteredMeta, null, 2)}`;
                } catch (e) {
                    // Si falla, mostrar al menos el mensaje de error
                    if (meta.error) {
                        log += `\nError: ${meta.error}`;
                    }
                }
            }
        }

        // Agregar stack trace si existe
        const errorStack = stack || meta.stack;
        if (errorStack && level.includes('error')) {
            log += `\n${errorStack}`;
        }

        return log;
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
