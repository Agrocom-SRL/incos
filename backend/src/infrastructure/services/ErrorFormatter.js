/**
 * Servicio de formateo de errores para respuestas HTTP
 *
 * Responsabilidades:
 * - Formatear errores operacionales (AppError)
 * - Formatear errores de validación
 * - Formatear errores inesperados del sistema
 * - Mantener consistencia en el formato de respuestas de error
 *
 * Ubicación: infrastructure/services (capa de infraestructura)
 *
 * Este servicio separa la lógica de formateo del middleware errorHandler,
 * siguiendo el principio de Single Responsibility (SRP).
 */
export class ErrorFormatter {
  /**
   * Formatea un error operacional (AppError) para respuesta HTTP
   *
   * @param {AppError} error - Error operacional
   * @param {Object} req - Request de Express
   * @returns {Object} Respuesta formateada
   */
  formatOperationalError(error, req) {
    return {
      success: false,
      error: {
        code: error.code || 'ERROR',
        message: error.message,
        ...(error.details && { details: error.details }),
        ...(error.extensions && Object.keys(error.extensions).length > 0 ? error.extensions : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    };
  }

  /**
   * Formatea un error de validación para respuesta HTTP
   *
   * @param {ValidationError} error - Error de validación (de domain/errors)
   * @param {Object} req - Request de Express
   * @returns {Object} Respuesta formateada
   */
  formatValidationError(error, req) {
    return {
      success: false,
      error: {
        code: error.code || 'VALIDATION_ERROR',
        message: error.message || 'Los datos proporcionados son inválidos',
        details: error.details || [],
        ...(error.extensions && Object.keys(error.extensions).length > 0 ? error.extensions : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    };
  }

  /**
   * Formatea un error inesperado del sistema para respuesta HTTP
   *
   * @param {Error} error - Error inesperado
   * @param {Object} req - Request de Express
   * @param {boolean} isProduction - Si está en producción
   * @returns {Object} Respuesta formateada
   */
  formatUnexpectedError(error, req, isProduction = false) {
    const statusCode = error.statusCode || 500;
    const message = isProduction
      ? 'Error interno del servidor'
      : error.message;

    return {
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message,
        ...(!isProduction && {
          stack: error.stack,
          name: error.name,
        }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    };
  }

  /**
   * Extrae información de error para logging
   *
   * @param {Error} error - Error a loguear
   * @param {Object} req - Request de Express
   * @returns {Object} Información del error para logging
   */
  extractErrorInfo(error, req) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      userId: req.user?.id,
      body: req.body,
      isOperational: error.isOperational,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    };

    // Información adicional de Sequelize si existe
    if (error.original) {
      errorInfo.sqlError = error.original.message;
      errorInfo.sqlCode = error.original.code;
      errorInfo.sqlState = error.original.sqlState;
    }

    return errorInfo;
  }
}

/**
 * Instancia singleton del ErrorFormatter
 * Se registra en el container para inyección de dependencias
 */
export const errorFormatter = new ErrorFormatter();

export default errorFormatter;
