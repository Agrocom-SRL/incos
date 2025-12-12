import { body, param } from 'express-validator';

/**
 * POST /api/v1/estudiantes/:id/licencias
 * Validaciones para solicitar licencia estudiantil
 * Basadas en RF-EST-005 y schema licencias_solicitudes
 */
export const requestLicenciaValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero válido'),

  body('carreraId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de carrera debe ser válido'),

  body('gestionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de gestión debe ser válido'),

  body('fechaDesde')
    .notEmpty()
    .withMessage('La fecha de inicio es requerida')
    .isISO8601()
    .withMessage('La fecha de inicio debe tener formato válido (YYYY-MM-DD)'),

  body('fechaHasta')
    .notEmpty()
    .withMessage('La fecha de fin es requerida')
    .isISO8601()
    .withMessage('La fecha de fin debe tener formato válido (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.body.fechaDesde && new Date(value) < new Date(req.body.fechaDesde)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),

  body('motivo')
    .notEmpty()
    .withMessage('El motivo es requerido')
    .isIn([
      'ENFERMEDAD',
      'TRABAJO',
      'FAMILIAR',
      'VIAJE',
      'ACADEMICO',
      'DEPORTIVO',
      'PERSONAL',
      'OTRO',
    ])
    .withMessage('El motivo debe ser uno de los valores válidos'),

  body('detalleMotivo')
    .notEmpty()
    .withMessage('El detalle del motivo es requerido')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El detalle del motivo debe tener entre 10 y 1000 caracteres'),
];
