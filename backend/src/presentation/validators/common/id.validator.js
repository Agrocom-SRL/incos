import { param } from 'express-validator';

/**
 * Validador común para parámetros de ID en rutas
 * 
 * Valida que el parámetro :id sea un número entero mayor a 0
 * 
 * @example
 * router.get('/:id', idValidator, validateRequest, controller);
 */
export const idValidator = [
  param('id')
    .notEmpty()
    .withMessage('El ID es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero mayor a 0')
    .toInt(),
];

