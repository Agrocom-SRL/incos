/**
 * Factory function para crear el middleware de manejo de errores
 * 
 * @param {ILogger} logger - Logger inyectado del container
 * @param {ErrorFormatter} errorFormatter - Formatter de errores inyectado del container
 * @returns {Function} Middleware de manejo de errores
 * 
 * Middleware genérico para manejo global de errores
 * Captura todos los errores no manejados y formatea respuestas según el estándar de la API
 * 
 * Responsabilidades:
 * - Coordinar el logging de errores
 * - Delegar el formateo a ErrorFormatter
 * - Enviar respuesta HTTP apropiada
 *
 * Uso:
 * const errorHandler = createErrorHandler(logger, errorFormatter);
 * app.use(errorHandler); // Al final de todas las rutas
 */
export function createErrorHandler(logger, errorFormatter) {
  return function errorHandler(err, req, res, next) {
    // Extraer información del error para logging
    const errorInfo = errorFormatter.extractErrorInfo(err, req);
    logger.error('Error en errorHandler:', errorInfo);

    // Error operacional conocido (AppError con isOperational = true)
    if (err.isOperational && err.statusCode < 500) {
      const response = errorFormatter.formatOperationalError(err, req);
      return res.status(err.statusCode).json(response);
    }

    // Error de validación de express-validator (si viene después del middleware de validación)
    if (err.statusCode === 400 && err.errors) {
      const response = errorFormatter.formatValidationError(err, req);
      return res.status(400).json(response);
    }

    // Error inesperado del sistema
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    const response = errorFormatter.formatUnexpectedError(err, req, isProduction);
    return res.status(statusCode).json(response);
  };
}

export default createErrorHandler;
