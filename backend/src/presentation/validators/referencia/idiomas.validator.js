import { body } from 'express-validator';

/**
 * Validators de Idiomas
 *
 * Shape distinto al de Discapacidad/TiposParentesco: idiomas.js no tiene
 * "descripcion", en su lugar tiene "codigoIso" (CHAR(3) opcional).
 * Por eso NO reutiliza buildNombreDescripcionValidators.
 */
export const createIdiomaValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('nombre debe tener entre 2 y 50 caracteres'),
  body('codigoIso')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 3 })
    .withMessage('codigoIso debe tener entre 2 y 3 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateIdiomaValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('nombre debe tener entre 2 y 50 caracteres'),
  body('codigoIso')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 3 })
    .withMessage('codigoIso debe tener entre 2 y 3 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
