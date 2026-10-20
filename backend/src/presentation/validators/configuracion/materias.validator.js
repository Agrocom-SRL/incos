import { body } from 'express-validator';

export const createMateriaValidator = [
  body('sigla')
    .notEmpty()
    .withMessage('sigla es requerida')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('sigla debe tener entre 2 y 50 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre debe tener entre 2 y 255 caracteres'),
  body('tipo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('tipo inválido'),
  body('clasificacion')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('clasificacion inválida'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];

export const updateMateriaValidator = [
  body('sigla')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('sigla debe tener entre 2 y 50 caracteres'),
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('nombre debe tener entre 2 y 255 caracteres'),
  body('tipo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('tipo inválido'),
  body('clasificacion')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('clasificacion inválida'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];
