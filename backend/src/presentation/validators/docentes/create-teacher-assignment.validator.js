import { body } from 'express-validator';

function pickBodyField(req, ...keys) {
  for (const key of keys) {
    const v = req.body?.[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

/**
 * Body para POST /docentes/asignaciones
 */
export const createTeacherAssignmentValidator = [
  body('gestionPlanId')
    .optional()
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'gestionPlanId', 'gestion_plan_id');
      if (v === undefined) throw new Error('gestionPlanId es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('gestionPlanId debe ser un entero positivo');
      return true;
    }),

  body('ofertaCursoId')
    .optional()
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'ofertaCursoId', 'oferta_curso_id', 'offerCourseId');
      if (v === undefined) throw new Error('ofertaCursoId es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('ofertaCursoId debe ser un entero positivo');
      return true;
    }),

  body('docenteId')
    .optional()
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'docenteId', 'docente_id');
      if (v === undefined) throw new Error('docenteId es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('docenteId debe ser un entero positivo');
      return true;
    }),

  body('cargaHoraria')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 200 })
    .withMessage('cargaHoraria debe ser un entero entre 0 y 200'),

  body('fechaAsignacion')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('fechaAsignacion debe tener formato YYYY-MM-DD'),

  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),
];
