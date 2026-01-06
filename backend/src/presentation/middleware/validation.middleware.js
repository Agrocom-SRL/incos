import { validationResult } from 'express-validator';
import { ValidationError } from '../../domain/errors/AppError.js';

/**
 * Factory function para crear el middleware de validación
 * 
 * @param {ILogger} logger - Logger inyectado del container
 * @returns {Function} Middleware de validación
 * 
 * Middleware genérico para validación de datos
 * Lanza ValidationError (de domain/errors) que será capturado por errorHandler
 *
 * Uso:
 * const validateRequest = createValidateRequest(logger);
 * router.post('/ruta', validator, validateRequest, controller);
 */
export function createValidateRequest(logger) {
  return function validateRequest(req, res, next) {
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

      // Lanzar ValidationError real (de domain/errors)
      // El errorHandler lo capturará y ErrorFormatter lo formateará
      const validationError = new ValidationError(
        'Los datos proporcionados son inválidos',
        errorDetails
      );
      return next(validationError);
    }

    next();
  };
}