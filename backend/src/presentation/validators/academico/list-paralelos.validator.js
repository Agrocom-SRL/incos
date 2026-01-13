import { query } from 'express-validator';
import { listValidator } from '../common/index.js';

/**
 * Validador para listar paralelos
 * 
 * Combina el validador común de listado (page, limit, search)
 * con validaciones específicas para paralelos (periodo_id, carrera_id)
 * 
 * Los parámetros específicos son opcionales, pero si se proporcionan
 * deben ser números enteros válidos.
 * 
 * @example
 * router.get('/', listParalelosValidator, validateRequest, controller);
 */
export const listParalelosValidator = [
  // 1. Validaciones comunes (page, limit, search)
  ...listValidator,

  // 2. Validaciones específicas de paralelos
  query('periodo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('periodo debe ser un número entero mayor a 0')
    .toInt(),

  query('periodo_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('periodo_id debe ser un número entero mayor a 0')
    .toInt(),

  query('carrera_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('carrera_id debe ser un número entero mayor a 0')
    .toInt(),
];
