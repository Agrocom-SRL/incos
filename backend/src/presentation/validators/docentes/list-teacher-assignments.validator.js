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
      query('ofertaCursoId').exists().bail().isInt({ min: 1 }),
      query('oferta_curso_id').exists().bail().isInt({ min: 1 }),
      query('cursoId').exists().bail().isInt({ min: 1 }),
      query('curso_id').exists().bail().isInt({ min: 1 }),
      query('parallelManagementId').exists().bail().isInt({ min: 1 }),
      query('paralelo_gestion_id').exists().bail().isInt({ min: 1 }),
    ],
    'Indique al menos uno: docenteId, gestionPlanId, ofertaCursoId, cursoId o paralelo_gestion_id'
  ),
  query('docenteId').optional().isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  query('gestionPlanId').optional().isInt({ min: 1 }).withMessage('gestionPlanId debe ser un entero positivo'),
  query('ofertaCursoId').optional().isInt({ min: 1 }).withMessage('ofertaCursoId debe ser un entero positivo'),
  query('oferta_curso_id').optional().isInt({ min: 1 }).withMessage('oferta_curso_id debe ser un entero positivo'),
  query('cursoId').optional().isInt({ min: 1 }).withMessage('cursoId debe ser un entero positivo'),
  query('curso_id').optional().isInt({ min: 1 }).withMessage('curso_id debe ser un entero positivo'),
  query('parallelManagementId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('parallelManagementId debe ser un entero positivo'),
  query('paralelo_gestion_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('paralelo_gestion_id debe ser un entero positivo'),
  query('vigente').optional().isIn(['true', 'false', '0', '1']).withMessage('vigente debe ser true o false'),
];
