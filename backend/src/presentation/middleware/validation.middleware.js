import { validationResult } from 'express-validator';

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
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos proporcionados son inválidos',
        details: errors.array().map((err) => ({
          field: err.param || err.path || err.location,
          message: err.msg,
          value: err.value,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
}

export default validateRequest;
