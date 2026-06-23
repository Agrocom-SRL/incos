import { body, param } from 'express-validator';

const bimestreParam = param('bimestre')
  .isInt({ min: 1, max: 4 })
  .withMessage('Bimestre debe ser entre 1 y 4');

const asignacionParam = param('asignacionId')
  .isInt({ min: 1 })
  .withMessage('Asignación inválida');

const puntosEnteros = (field) =>
  body(field)
    .custom((value) => {
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 100) {
        throw new Error('Los puntos deben ser un entero entre 1 y 100');
      }
      return true;
    })
    .withMessage('Puntos inválidos');

export const getCuadernoBimestreValidator = [asignacionParam, bimestreParam];

export const getBimestreConsolidadoValidator = [asignacionParam, bimestreParam];

export const createEvaluacionCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  body('tipoEvaluacionId').isInt({ min: 1 }).withMessage('Tipo requerido'),
  body('nombre').trim().notEmpty().isLength({ max: 255 }).withMessage('Nombre requerido'),
  body('componente').isIn(['TEORICO', 'PRACTICO']).withMessage('Componente inválido'),
  puntosEnteros('puntos'),
  body('fecha').optional({ nullable: true }).isISO8601().withMessage('Fecha inválida'),
];

export const updateEvaluacionCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  param('evaluacionId').isInt({ min: 1 }),
  body('tipoEvaluacionId').optional().isInt({ min: 1 }),
  body('nombre').optional().trim().notEmpty().isLength({ max: 255 }),
  body('componente').optional().isIn(['TEORICO', 'PRACTICO']),
  body('puntos').optional().custom((value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 100) {
      throw new Error('Los puntos deben ser un entero entre 1 y 100');
    }
    return true;
  }),
  body('fecha').optional({ nullable: true }).isISO8601(),
];

export const deleteEvaluacionCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  param('evaluacionId').isInt({ min: 1 }),
];

const validarNotaCelda = (value) => {
  if (value === null || value === '') return true;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error('La nota debe ser un entero mayor o igual a 0');
  }
  return true;
};

export const guardarNotasCuadernoBimestreValidator = [
  asignacionParam,
  bimestreParam,
  body('notas').optional().isArray().withMessage('notas debe ser un arreglo'),
  body('notas.*.estudianteId').optional().isInt({ min: 1 }),
  body('notas.*.evaluacionId').optional().isInt({ min: 1 }),
  body('notas.*.nota').optional({ nullable: true }).custom(validarNotaCelda),
];

export const upsertNotaCuadernoValidator = [
  asignacionParam,
  bimestreParam,
  body('estudianteId').isInt({ min: 1 }).withMessage('Estudiante requerido'),
  body('evaluacionId').isInt({ min: 1 }).withMessage('Evaluación requerida'),
  body('nota').optional({ nullable: true }).custom(validarNotaCelda),
];
