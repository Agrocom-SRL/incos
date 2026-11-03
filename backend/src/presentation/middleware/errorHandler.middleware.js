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
import { ValidationError, UnprocessableEntityError } from '../../domain/errors/AppError.js';

function esErrorDeClienteExplicito(err) {
  return (
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode < 500 &&
    !('expose' in err)
  );
}

export function createErrorHandler(logger, errorFormatter) {
  return function errorHandler(err, req, res, _next) {
    // Extraer información del error para logging
    const errorInfo = errorFormatter.extractErrorInfo(err, req);
    logger.error('Error en errorHandler:', errorInfo);

    // Error de Multer (upload de archivos)
    if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      const response = errorFormatter.formatValidationError(
        new ValidationError(err.message || 'Error al subir el archivo', []),
        req
      );
      return res.status(400).json(response);
    }

    // Error operacional conocido (AppError con isOperational = true)
    // Esto incluye: NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, etc.
    if (err.isOperational && err.statusCode < 500) {
      const response = errorFormatter.formatOperationalError(err, req);
      return res.status(err.statusCode).json(response);
    }

    // ValidationError específico (tiene details en lugar de errors)
    if (err instanceof ValidationError) {
      const response = errorFormatter.formatValidationError(err, req);
      return res.status(400).json(response);
    }

    // 422 Unprocessable Entity (mismo cuerpo que validación)
    if (err instanceof UnprocessableEntityError) {
      const response = errorFormatter.formatValidationError(err, req);
      return res.status(422).json(response);
    }

    // Error 4xx lanzado a mano por un use case (`Error` con `statusCode`/`code`, sin ser AppError):
    // es un error de cliente deliberado, se responde con su mensaje y NUNCA con stack, en ningún entorno.
    // Los errores de http-errors/body-parser (tienen `expose`) siguen la ruta genérica de abajo.
    if (esErrorDeClienteExplicito(err)) {
      const response = errorFormatter.formatOperationalError(err, req);
      return res.status(err.statusCode).json(response);
    }

    // Error inesperado del sistema
    const statusCode = err.statusCode || 500;
    // Stack y mensaje internos solo en desarrollo; test/staging/producción responden genérico.
    // Ningún 4xx expone stack, ni siquiera en desarrollo.
    const isProduction = (process.env.NODE_ENV ?? 'development') !== 'development' || statusCode < 500;
    const response = errorFormatter.formatUnexpectedError(err, req, isProduction);
    return res.status(statusCode).json(response);
  };
}

export default createErrorHandler;
