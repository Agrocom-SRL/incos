import { query } from 'express-validator';
import { listValidator } from '../common/index.js';

/**
 * Validador para listar provincias
 * 
 * Combina el validador común de listado (page, limit, search)
 * con validaciones específicas para provincias (departamentoId)
 * 
 * @example
 * router.get('/', listProvinciasValidator, validateRequest, controller);
 */
export const listProvinciasValidator = [
  // 1. Validaciones comunes (page, limit, search)
  ...listValidator,

  // 2. Validaciones específicas de provincias
  query('departamentoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('departamentoId debe ser un número entero mayor a 0')
    .toInt(),
];
