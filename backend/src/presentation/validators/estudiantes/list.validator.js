import { query } from 'express-validator';

/**
 * GET /api/v1/estudiantes
 * Validaciones para query parameters de listado
 */
export const listStudentsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres'),

  query('carrera')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de carrera debe ser válido'),

  query('estado')
    .optional()
    .isIn(['REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO'])
    .withMessage(
      'El estado debe ser uno de: REGULAR, NIVELACION, RETIRADO, EGRESADO, ABANDONO'
    ),

  query('gestiones')
    .optional()
    .trim()
    .matches(/^\d{4}-[12]$/)
    .withMessage('La gestión debe tener formato YYYY-X (ej: 2025-1)'),

  query('sort')
    .optional()
    .trim()
    .matches(/^-?(apellido_paterno|apellido_materno|nombres|created_at|codigo_estudiante)$/)
    .withMessage('El campo de ordenamiento no es válido'),
];
