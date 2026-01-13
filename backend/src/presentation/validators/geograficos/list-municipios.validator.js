import { query } from 'express-validator';
import { listValidator } from '../common/index.js';

/**
 * Validador para listar municipios
 * 
 * Combina el validador común de listado (page, limit, search)
 * con validaciones específicas para municipios (provinciaId)
 * 
 * @example
 * router.get('/', listMunicipiosValidator, validateRequest, controller);
 */
export const listMunicipiosValidator = [
  // 1. Validaciones comunes (page, limit, search)
  ...listValidator,

  // 2. Validaciones específicas de municipios
  query('provinciaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('provinciaId debe ser un número entero mayor a 0')
    .toInt(),
];
