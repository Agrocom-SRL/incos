import { body } from 'express-validator';

export const createCarreraValidator = [
  body('codigo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('codigo debe tener entre 2 y 50 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre debe tener entre 2 y 255 caracteres'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const updateCarreraValidator = [
  body('codigo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('codigo debe tener entre 2 y 50 caracteres'),
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre debe tener entre 2 y 255 caracteres'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

