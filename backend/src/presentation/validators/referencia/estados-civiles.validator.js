import { body } from 'express-validator';

/**
 * Validators de Estados Civiles
 *
 * Shape distinto al de Discapacidad/TiposParentesco: estados-civiles.js no tiene
 * "descripcion", en su lugar tiene "abreviatura" (VARCHAR(5) opcional).
 * Por eso NO reutiliza buildNombreDescripcionValidators (mismo motivo que idiomas.validator.js).
 */
export const createEstadoCivilValidator = [
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('nombre debe tener entre 2 y 20 caracteres'),
  body('abreviatura')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('abreviatura debe tener entre 1 y 5 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateEstadoCivilValidator = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('nombre debe tener entre 2 y 20 caracteres'),
  body('abreviatura')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('abreviatura debe tener entre 1 y 5 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
