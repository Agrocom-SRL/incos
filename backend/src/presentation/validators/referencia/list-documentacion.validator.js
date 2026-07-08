import { query } from 'express-validator';
import { listValidator } from '../common/index.js';
import { TIPOS_DOCUMENTO_SISTEMA_VALUES } from '../../../domain/constants/index.js';

/**
 * Validador para listar tipos de documentación
 *
 * Combina el validador común de listado (page, limit, search)
 * con validaciones específicas para documentación (tipoDocumento, incluirInactivos)
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
    .isIn(TIPOS_DOCUMENTO_SISTEMA_VALUES)
    .withMessage(`tipoDocumento debe ser uno de: ${TIPOS_DOCUMENTO_SISTEMA_VALUES.join(', ')}`),
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];
