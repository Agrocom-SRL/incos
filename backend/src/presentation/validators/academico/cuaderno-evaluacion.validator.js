import { body, param } from 'express-validator';

const bimestreParam = param('bimestre')
  .isInt({ min: 1, max: 4 })
  .withMessage('Bimestre debe ser entre 1 y 4');

const asignacionParam = param('asignacionId')
  .isInt({ min: 1 })
  .withMessage('Asignación inválida');

export const getCuadernoBimestreValidator = [asignacionParam, bimestreParam];

export const createEvaluacionCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  body('tipoEvaluacionId').isInt({ min: 1 }).withMessage('Tipo requerido'),
  body('nombre').trim().notEmpty().isLength({ max: 255 }).withMessage('Nombre requerido'),
  body('componente').isIn(['TEORICO', 'PRACTICO']).withMessage('Componente inválido'),
  body('peso').isFloat({ min: 0.01, max: 100 }).withMessage('Peso inválido'),
  body('fecha').optional({ nullable: true }).isISO8601().withMessage('Fecha inválida'),
];

export const updateEvaluacionCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  param('evaluacionId').isInt({ min: 1 }),
  body('tipoEvaluacionId').optional().isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 255 }),
  body('componente').optional().isIn(['TEORICO', 'PRACTICO']),
  body('peso').optional().isFloat({ min: 0.01, max: 100 }),
  body('fecha').optional({ nullable: true }).isISO8601(),
];

export const deleteEvaluacionCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  param('evaluacionId').isInt({ min: 1 }),
];

export const guardarNotasCuadernoBimestreValidator = [
  asignacionParam,
  bimestreParam,
  body('notas').optional().isArray().withMessage('notas debe ser un arreglo'),
  body('notas.*.estudianteId').optional().isInt({ min: 1 }),
  body('notas.*.evaluacionId').optional().isInt({ min: 1 }),
  body('notas.*.nota')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        throw new Error('La nota debe estar entre 0 y 100');
      }
      return true;
    }),
];

export const upsertNotaCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  body('estudianteId').isInt({ min: 1 }).withMessage('Estudiante requerido'),
  body('evaluacionId').isInt({ min: 1 }).withMessage('Evaluación requerida'),
  body('nota')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        throw new Error('La nota debe estar entre 0 y 100');
      }
      return true;
    }),
];
