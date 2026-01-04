/**
 * Interfaz del servicio de logging
 * Define el contrato que debe cumplir cualquier implementación de logger
 */
export class ILogger {
  /**
   * Log de nivel error
   * @param {string} message - Mensaje de error
   * @param {Object} meta - Metadata adicional (opcional)
   */
  error(message, meta = {}) {
    throw new Error('Method error must be implemented');
  }

  /**
   * Log de nivel warn
   * @param {string} message - Mensaje de advertencia
   * @param {Object} meta - Metadata adicional (opcional)
   */
  warn(message, meta = {}) {
    throw new Error('Method warn must be implemented');
  }

  /**
   * Log de nivel info
   * @param {string} message - Mensaje informativo
   * @param {Object} meta - Metadata adicional (opcional)
   */
  info(message, meta = {}) {
    throw new Error('Method info must be implemented');
  }

  /**
   * Log de nivel http (para requests HTTP)
   * @param {string} message - Mensaje HTTP
   * @param {Object} meta - Metadata adicional (opcional)
   */
  http(message, meta = {}) {
    throw new Error('Method http must be implemented');
  }

  /**
   * Log de nivel verbose
   * @param {string} message - Mensaje detallado
   * @param {Object} meta - Metadata adicional (opcional)
   */
  verbose(message, meta = {}) {
    throw new Error('Method verbose must be implemented');
  }

  /**
   * Log de nivel debug
   * @param {string} message - Mensaje de debug
   * @param {Object} meta - Metadata adicional (opcional)
   */
  debug(message, meta = {}) {
    throw new Error('Method debug must be implemented');
  }

  /**
   * Log de nivel silly
   * @param {string} message - Mensaje silly
   * @param {Object} meta - Metadata adicional (opcional)
   */
  silly(message, meta = {}) {
    throw new Error('Method silly must be implemented');
  }
}

