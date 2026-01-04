import { validationResult } from 'express-validator';
import { logger } from '../../infrastructure/config/logger.config.js';

/**
 * Middleware genérico para validación de datos
 * Formatea errores de express-validator según el estándar de la API
 *
 * Uso:
 * router.post('/ruta', validator, validateRequest, controller);
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param || err.location,
      message: err.msg,
      value: err.value,
    }));

    // Log detallado con JSON.stringify para que se vea completo en consola
    logger.warn(`Error de validación en request ${req.method} ${req.originalUrl}`);
    console.error('Errores de validación:', JSON.stringify(errorDetails, null, 2));
    console.error('Body recibido:', JSON.stringify(req.body, null, 2));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos proporcionados son inválidos',
        details: errorDetails,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
}

export default validateRequest;
