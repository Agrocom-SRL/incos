import { body, param } from 'express-validator';

/**
 * POST /api/v1/bancos-autorizados
 * Crear banco autorizado (metodo_pago_id?, codigo, nombre).
 */
export const createBancoAutorizadoValidator = [
  body('codigo')
    .notEmpty()
    .withMessage('codigo es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('codigo debe tener entre 1 y 30 caracteres'),

  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('nombre debe tener entre 1 y 100 caracteres'),

  body('metodo_pago_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('metodo_pago_id debe ser un entero positivo')
    .toInt(),

  body('activo')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('activo debe ser booleano')
    .toBoolean(),
];

/**
 * PUT /api/v1/bancos-autorizados/:id
 * Editar banco autorizado (todos los campos opcionales).
 */
export const updateBancoAutorizadoValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero positivo')
    .toInt(),

  body('codigo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('codigo debe tener entre 1 y 30 caracteres'),

  body('nombre')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('nombre debe tener entre 1 y 100 caracteres'),

  body('metodo_pago_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('metodo_pago_id debe ser un entero positivo')
    .toInt(),

  body('activo')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('activo debe ser booleano')
    .toBoolean(),
];
