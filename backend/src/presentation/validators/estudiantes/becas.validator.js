import { body, param } from 'express-validator';

/**
 * POST /api/v1/estudiantes/:id/becas
 * Validaciones para asignar beca a estudiante
 * Basadas en RF-EST-004 y schema estudiantes_becas
 */
export const assignBecaValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero válido'),

  body('becaDescuentoId')
    .notEmpty()
    .withMessage('El ID de beca/descuento es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de beca/descuento debe ser válido'),

  body('gestionId')
    .notEmpty()
    .withMessage('La gestión es requerida')
    .isInt({ min: 1 })
    .withMessage('El ID de gestión debe ser válido'),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo es requerido')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('El motivo debe tener entre 10 y 500 caracteres'),

  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe tener formato válido (YYYY-MM-DD)'),

  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe tener formato válido (YYYY-MM-DD)'),

  body('documentosRespaldo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción de documentos no puede exceder 500 caracteres'),
];
