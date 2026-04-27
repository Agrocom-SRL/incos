import { query, oneOf } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

/**
 * Query para GET /docentes/asignaciones — exige al menos un filtro de alcance.
 */
export const listTeacherAssignmentsValidator = [
  ...listValidator,
  oneOf(
    [
      query('docenteId').exists().bail().isInt({ min: 1 }),
      query('gestionPlanId').exists().bail().isInt({ min: 1 }),
      query('cursoId').exists().bail().isInt({ min: 1 }),
    ],
    'Indique al menos uno: docenteId, gestionPlanId o cursoId'
  ),
  query('docenteId').optional().isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  query('gestionPlanId').optional().isInt({ min: 1 }).withMessage('gestionPlanId debe ser un entero positivo'),
  query('cursoId').optional().isInt({ min: 1 }).withMessage('cursoId debe ser un entero positivo'),
  query('vigente').optional().isIn(['true', 'false', '0', '1']).withMessage('vigente debe ser true o false'),
];
