import { body, param } from 'express-validator';

/**
 * POST /api/v1/configuracion-aportes
 * Crear configuración de aporte. gestion_id opcional (default: gestión vigente).
 */
export const createConfiguracionAporteValidator = [
  body('monto_base')
    .notEmpty()
    .withMessage('monto_base es requerido')
    .isFloat({ min: 0 })
    .withMessage('monto_base debe ser un número mayor o igual a 0')
    .toFloat(),

  body('gestion_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('gestion_id debe ser un entero positivo')
    .toInt(),

  body('aporte_activo')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('aporte_activo debe ser booleano')
    .toBoolean(),

  body('fecha_inicio')
    .notEmpty()
    .withMessage('fecha_inicio es requerida')
    .isISO8601()
    .withMessage('fecha_inicio debe estar en formato YYYY-MM-DD'),

  body('fecha_fin')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fecha_fin debe estar en formato YYYY-MM-DD'),
];

/**
 * PUT /api/v1/configuracion-aportes/:id
 * Editar configuración de aporte (todos los campos opcionales).
 */
export const updateConfiguracionAporteValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero positivo')
    .toInt(),

  body('monto_base')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('monto_base debe ser un número mayor o igual a 0')
    .toFloat(),

  body('aporte_activo')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('aporte_activo debe ser booleano')
    .toBoolean(),

  body('fecha_inicio')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fecha_inicio debe estar en formato YYYY-MM-DD'),

  body('fecha_fin')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('fecha_fin debe estar en formato YYYY-MM-DD'),

  body('activo')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('activo debe ser booleano')
    .toBoolean(),
];
