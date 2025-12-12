import { param } from 'express-validator';

/**
 * GET /api/v1/estudiantes/:id
 * Validaciones para parámetros de ruta
 */
export const getStudentByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero válido'),
];
