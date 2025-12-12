import { body, param } from 'express-validator';

/**
 * PUT /api/v1/estudiantes/:id
 * Validaciones para actualizar datos de estudiante
 * Campos actualizables: contacto, dirección, email (no CI, nombres, fecha nacimiento)
 */
export const updateStudentValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero válido'),

  body('celular')
    .optional()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El celular debe tener entre 7 y 8 dígitos'),

  body('telefonoFijo')
    .optional()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El teléfono fijo debe tener entre 7 y 8 dígitos'),

  body('emailPersonal')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail(),

  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),

  body('municipioResidenciaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El municipio de residencia debe ser un ID válido'),

  body('zona')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La zona no puede exceder 100 caracteres'),
];
