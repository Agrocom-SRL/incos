import { body, param } from 'express-validator';

/**
 * PATCH /api/v1/estudiantes/:id/estado
 * Validaciones para cambiar estado académico
 * Basadas en RF-EST-006 y schema estudiantes_datos_academicos
 */
export const changeStudentStatusValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero válido'),

  body('nuevoEstado')
    .notEmpty()
    .withMessage('El nuevo estado es requerido')
    .isIn(['REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO'])
    .withMessage(
      'El estado debe ser uno de: REGULAR, NIVELACION, RETIRADO, EGRESADO, ABANDONO'
    ),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo es requerido')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('El motivo debe tener entre 10 y 500 caracteres'),

  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
];
