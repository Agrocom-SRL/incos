import { body } from 'express-validator';

function pickBodyField(req, ...keys) {
  for (const key of keys) {
    const v = req.body?.[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

export const assignTeacherToCourseValidator = [
  body('ofertaCursoId')
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'ofertaCursoId', 'oferta_curso_id', 'offerCourseId');
      if (v === undefined) throw new Error('ofertaCursoId es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('ofertaCursoId debe ser un entero positivo');
      return true;
    }),
  body('docenteId')
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'docenteId', 'docente_id');
      if (v === undefined) throw new Error('docenteId es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('docenteId debe ser un entero positivo');
      return true;
    }),
  body('gestionPlanId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('gestionPlanId debe ser un entero positivo'),
  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),
];
