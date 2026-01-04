import { ILogger } from '../../../domain/interfaces/services/ILogger.js';
import winstonLogger from '../config/logger.config.js';

/**
 * Adaptador de Winston Logger que implementa ILogger
 * 
 * Este adaptador permite que Winston cumpla con el contrato ILogger del dominio,
 * manteniendo la inversión de dependencias (Dependency Inversion Principle).
 * 
 * Clean Architecture:
 * - Domain Layer: Define ILogger (interfaz)
 * - Infrastructure Layer: WinstonLoggerAdapter implementa ILogger usando Winston
 * 
 * @implements {ILogger}
 */
export class WinstonLoggerAdapter extends ILogger {
  constructor(winstonInstance = winstonLogger) {
    super();
    this.winston = winstonInstance;
  }

  /**
   * Log de nivel error
   * @param {string} message - Mensaje de error
   * @param {Object} meta - Metadata adicional (opcional)
   */
  error(message, meta = {}) {
    this.winston.error(message, meta);
  }

  /**
   * Log de nivel warn
   * @param {string} message - Mensaje de advertencia
   * @param {Object} meta - Metadata adicional (opcional)
   */
  warn(message, meta = {}) {
    this.winston.warn(message, meta);
  }

  /**
   * Log de nivel info
   * @param {string} message - Mensaje informativo
   * @param {Object} meta - Metadata adicional (opcional)
   */
  info(message, meta = {}) {
    this.winston.info(message, meta);
  }

  /**
   * Log de nivel http (para requests HTTP)
   * @param {string} message - Mensaje HTTP
   * @param {Object} meta - Metadata adicional (opcional)
   */
  http(message, meta = {}) {
    this.winston.http(message, meta);
  }

  /**
   * Log de nivel verbose
   * @param {string} message - Mensaje detallado
   * @param {Object} meta - Metadata adicional (opcional)
   */
  verbose(message, meta = {}) {
    this.winston.verbose(message, meta);
  }

  /**
   * Log de nivel debug
   * @param {string} message - Mensaje de debug
   * @param {Object} meta - Metadata adicional (opcional)
   */
  debug(message, meta = {}) {
    this.winston.debug(message, meta);
  }

  /**
   * Log de nivel silly
   * @param {string} message - Mensaje silly
   * @param {Object} meta - Metadata adicional (opcional)
   */
  silly(message, meta = {}) {
    this.winston.silly(message, meta);
  }

  /**
   * Stream para Morgan (middleware de HTTP logging)
   * Mantiene compatibilidad con el stream original de Winston
   * @returns {Object} Stream con método write
   */
  get stream() {
    // Si Winston ya tiene stream, usarlo; si no, crear uno que use http()
    if (this.winston.stream) {
      return this.winston.stream;
    }
    return {
      write: (message) => this.http(message.trim()),
    };
  }
}

/**
 * Instancia singleton del adaptador
 */
export const logger = new WinstonLoggerAdapter();

// Mantener compatibilidad con el stream de Winston para Morgan
// El stream se asigna directamente a la instancia para que funcione con middleware
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;

