import winston from 'winston';

/**
 * Logger compartido de la aplicación
 * Mecanismo técnico compartido entre todas las capas
 * 
 * Configuración básica de logger que imprime en consola con formato simple y colores
 */

// Formato para consola (con colores y timestamp)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Logger principal (solo consola)
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: consoleFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  exitOnError: false,
});

// Stream para Morgan (middleware de HTTP logging)
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
