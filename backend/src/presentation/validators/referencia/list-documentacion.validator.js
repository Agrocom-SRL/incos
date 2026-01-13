import { query } from 'express-validator';
import { listValidator } from '../common/index.js';

/**
 * Validador para listar tipos de documentación
 * 
 * Combina el validador común de listado (page, limit, search)
 * con validaciones específicas para documentación (tipoDocumento)
 * 
 * @example
 * router.get('/', listDocumentacionValidator, validateRequest, controller);
 */
export const listDocumentacionValidator = [
  // 1. Validaciones comunes (page, limit, search)
  ...listValidator,

  // 2. Validaciones específicas de documentación
  query('tipoDocumento')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('tipoDocumento debe tener entre 1 y 50 caracteres'),
];
