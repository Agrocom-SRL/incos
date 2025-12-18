import { logger } from '../../shared/logger.js';

/**
 * Middleware genérico para manejo global de errores
 * Captura todos los errores no manejados y formatea respuestas según el estándar de la API
 *
 * Uso:
 * app.use(errorHandler); // Al final de todas las rutas
 */
function errorHandler(err, req, res, next) {
  // Log del error para debugging con más detalles
  logger.error('Error en errorHandler:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent'],
    'content-type': req.headers['content-type'],
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    userId: req.user?.id,
    body: req.body,
    isOperational: err.isOperational,
    statusCode: err.statusCode,
    code: err.code,
    details: err.details,
    // Información adicional de Sequelize si existe
    ...(err.original && {
      sqlError: err.original.message,
      sqlCode: err.original.code,
      sqlState: err.original.sqlState,
    }),
  });

  // Error operacional conocido (AppError con isOperational = true)
  if (err.isOperational && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        ...(err.details && { details: err.details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  }

  // Error de validación de express-validator (si viene después del middleware de validación)
  if (err.statusCode === 400 && err.errors) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message || 'Los datos proporcionados son inválidos',
        details: err.errors,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  }

  // Error inesperado del sistema
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        name: err.name,
      }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
}

export default errorHandler;
