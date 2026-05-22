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
