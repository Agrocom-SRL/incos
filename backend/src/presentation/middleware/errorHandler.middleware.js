import { logger } from '../../config/logger.js';

function errorHandler(err, req, res, next) {
  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Error operacional conocido (AppError)
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
        requestId: req.id, // Si se implementa request ID tracking
      },
    });
  }

  // Error inesperado
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
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
}

export default errorHandler;
