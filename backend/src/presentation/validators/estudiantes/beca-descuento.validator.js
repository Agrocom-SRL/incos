import { body } from 'express-validator';
import { TIPOS_BECA_AUTOMATICA_VALUES } from '../../../domain/constants/becas.constants.js';

/**
 * Validators para el catálogo maestro Becas y descuentos (becas_descuentos)
 *
 * Shape propio (no reutiliza el genérico nombre-descripcion.validator.js):
 * nombre, codigo, porcentaje, descripcion, requiereDocumentacion,
 * requiereAprobacionRector, esAutomatica, tipoAutomatica, promedioMinimo, activo.
 */

/**
 * POST /api/v1/becas-descuentos
 */
export const createBecaDescuentoValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),

  body('codigo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('codigo no debe superar 20 caracteres'),

  body('porcentaje')
    .notEmpty()
    .withMessage('porcentaje es requerido')
    .isFloat({ min: 0, max: 100 })
    .withMessage('porcentaje debe ser un número entre 0 y 100'),

  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('descripcion no debe superar 500 caracteres'),

  body('requiereDocumentacion')
    .optional()
    .isBoolean()
    .withMessage('requiereDocumentacion debe ser boolean'),

  body('requiereAprobacionRector')
    .optional()
    .isBoolean()
    .withMessage('requiereAprobacionRector debe ser boolean'),

  body('esAutomatica')
    .optional()
    .isBoolean()
    .withMessage('esAutomatica debe ser boolean'),

  body('tipoAutomatica')
    .optional()
    .isIn(TIPOS_BECA_AUTOMATICA_VALUES)
    .withMessage(`tipoAutomatica debe ser uno de: ${TIPOS_BECA_AUTOMATICA_VALUES.join(', ')}`),

  body('promedioMinimo')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('promedioMinimo debe ser un número entre 0 y 100')
    .custom((value, { req }) => {
      if (req.body.tipoAutomatica === 'PROMEDIO_90' && (value === undefined || value === null || value === '')) {
        throw new Error('promedioMinimo es requerido cuando tipoAutomatica es PROMEDIO_90');
      }
      return true;
    }),

  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

/**
 * PUT /api/v1/becas-descuentos/:id
 * Actualización parcial: todos los campos son opcionales.
 */
export const updateBecaDescuentoValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),

  body('codigo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('codigo no debe superar 20 caracteres'),

  body('porcentaje')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('porcentaje debe ser un número entre 0 y 100'),

  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('descripcion no debe superar 500 caracteres'),

  body('requiereDocumentacion')
    .optional()
    .isBoolean()
    .withMessage('requiereDocumentacion debe ser boolean'),

  body('requiereAprobacionRector')
    .optional()
    .isBoolean()
    .withMessage('requiereAprobacionRector debe ser boolean'),

  body('esAutomatica')
    .optional()
    .isBoolean()
    .withMessage('esAutomatica debe ser boolean'),

  body('tipoAutomatica')
    .optional()
    .isIn(TIPOS_BECA_AUTOMATICA_VALUES)
    .withMessage(`tipoAutomatica debe ser uno de: ${TIPOS_BECA_AUTOMATICA_VALUES.join(', ')}`),

  body('promedioMinimo')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('promedioMinimo debe ser un número entre 0 y 100')
    .custom((value, { req }) => {
      if (req.body.tipoAutomatica === 'PROMEDIO_90' && (value === undefined || value === null || value === '')) {
        throw new Error('promedioMinimo es requerido cuando tipoAutomatica es PROMEDIO_90');
      }
      return true;
    }),

  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
