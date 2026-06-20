import { body, param } from 'express-validator';

/**
 * PUT /api/v1/metodos-pago/:id
 * Editar método de pago: nombre y/o estado activo (códigos fijos, no editables).
 */
export const updateMetodoPagoValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero positivo')
    .toInt(),

  body('nombre')
    .optional({ nullable: true })
    .isString()
    .withMessage('nombre debe ser texto')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('nombre debe tener entre 1 y 100 caracteres'),

  body('activo')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('activo debe ser booleano')
    .toBoolean(),
];
