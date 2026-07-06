import { body } from 'express-validator';
import { TIPOS_DOCUMENTO_SISTEMA_VALUES } from '../../../domain/constants/index.js';

/**
 * Validador para actualizar un tipo de documentación
 *
 * La regla de negocio de documentoPadreId (mismo tipoDocumento, no ser
 * documento del sistema, no auto-referenciarse) se valida en el use case
 * (UpdateDocumentacionUseCase), no aquí: requiere consultar el repositorio.
 */
export const updateDocumentacionValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('nombre debe tener entre 2 y 200 caracteres'),
  body('tipoDocumento')
    .optional()
    .isIn(TIPOS_DOCUMENTO_SISTEMA_VALUES)
    .withMessage(`tipoDocumento debe ser uno de: ${TIPOS_DOCUMENTO_SISTEMA_VALUES.join(', ')}`),
  body('aceptaFotocopia').optional().isBoolean().withMessage('aceptaFotocopia debe ser boolean'),
  body('requerido').optional().isBoolean().withMessage('requerido debe ser boolean'),
  body('orden').optional().isInt({ min: 0 }).withMessage('orden debe ser un entero >= 0'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('descripcion no debe superar 500 caracteres'),
  body('documentoPadreId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('documentoPadreId debe ser un entero válido'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
