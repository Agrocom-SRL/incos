import { validationResult } from 'express-validator';
import container from '../../infrastructure/container/index.js';
import { TOKENS } from '../../infrastructure/container/tokens.js';

/**
 * Factory function para crear el middleware de validación
 * 
 * @param {ILogger} logger - Logger inyectado del container
 * @returns {Function} Middleware de validación
 * 
 * Middleware genérico para validación de datos
 * Formatea errores de express-validator según el estándar de la API
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
  };
}

// Instancia por defecto usando logger del container (para compatibilidad con routes)
// NOTA: Se recomienda usar createValidateRequest(logger) directamente cuando sea posible
const logger = container.resolve(TOKENS.logger);
const defaultValidateRequest = createValidateRequest(logger);

// Export por defecto (para compatibilidad con routes existentes)
export default defaultValidateRequest;
