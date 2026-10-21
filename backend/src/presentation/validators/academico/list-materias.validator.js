import { query } from 'express-validator';
import { listValidator } from '../common/index.js';

/**
 * Validador para listar materias
 *
 * Combina el validador común de listado (page, limit, search)
 * con validaciones específicas para materias (periodo_id)
 *
 * Los parámetros específicos son opcionales, pero si se proporcionan
 * deben ser números enteros válidos.
 *
 * @example
 * router.get('/', listMateriasValidator, validateRequest, controller);
 */
export const listMateriasValidator = [
  // 1. Validaciones comunes (page, limit, search)
  ...listValidator,

  // 2. Validaciones específicas de materias
  query('periodo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('periodo_id debe ser un número entero mayor a 0')
    .toInt(),
];
