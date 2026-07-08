import { body, query } from 'express-validator';
import { listValidator } from '../common/index.js';
import { TIPOS_ACTIVIDAD_VALUES } from '../../../domain/constants/index.js';

/**
 * Validador de listado de actividades
 * Combina el validador común (page, limit, search) con filtros específicos (tipo, esDestacada)
 */
export const listActividadesValidator = [
  ...listValidator,
  query('tipo')
    .optional()
    .isIn(TIPOS_ACTIVIDAD_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_ACTIVIDAD_VALUES.join(', ')}`),
  query('esDestacada').optional().isBoolean().withMessage('esDestacada debe ser boolean'),
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];

export const createActividadValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('nombre debe tener entre 2 y 200 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('descripcion no debe superar 500 caracteres'),
  body('tipo')
    .optional({ nullable: true })
    .isIn(TIPOS_ACTIVIDAD_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_ACTIVIDAD_VALUES.join(', ')}`),
  body('esDestacada').optional().isBoolean().withMessage('esDestacada debe ser boolean'),
  // icono: texto libre (nombre de icono de UI), sin validación estricta de formato
  body('icono')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('icono no debe superar 50 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateActividadValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('nombre debe tener entre 2 y 200 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('descripcion no debe superar 500 caracteres'),
  body('tipo')
    .optional({ nullable: true })
    .isIn(TIPOS_ACTIVIDAD_VALUES)
    .withMessage(`tipo debe ser uno de: ${TIPOS_ACTIVIDAD_VALUES.join(', ')}`),
  body('esDestacada').optional().isBoolean().withMessage('esDestacada debe ser boolean'),
  // icono: texto libre (nombre de icono de UI), sin validación estricta de formato
  body('icono')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('icono no debe superar 50 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
