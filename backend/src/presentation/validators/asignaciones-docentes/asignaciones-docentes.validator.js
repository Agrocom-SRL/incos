import { body } from 'express-validator';

function pickBodyField(req, ...keys) {
  for (const key of keys) {
    const v = req.body?.[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

export const createAsignacionDocenteValidator = [
  body('gestion_plan_id')
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'gestion_plan_id', 'gestionPlanId');
      if (v === undefined) throw new Error('gestion_plan_id es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('gestion_plan_id debe ser un entero positivo');
      return true;
    }),

  body('oferta_curso_id')
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'oferta_curso_id', 'ofertaCursoId', 'offerCourseId');
      if (v === undefined) throw new Error('oferta_curso_id es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('oferta_curso_id debe ser un entero positivo');
      return true;
    }),

  body('docente_id')
    .custom((_, { req }) => {
      const v = pickBodyField(req, 'docente_id', 'docenteId', 'teacherId');
      if (v === undefined) throw new Error('docente_id es requerido');
      const n = Number(v);
      if (!Number.isFinite(n) || n < 1) throw new Error('docente_id debe ser un entero positivo');
      return true;
    }),

  body('carga_horaria')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 200 })
    .withMessage('carga_horaria debe ser un entero entre 0 y 200'),

  body('fecha_asignacion')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('fecha_asignacion debe tener formato YYYY-MM-DD'),

  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),

  body('confirmar_sobrecarga')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('confirmar_sobrecarga debe ser booleano'),
];

export const updateAsignacionDocenteValidator = [
  body('docente_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('docente_id inválido'),
  body('oferta_curso_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('oferta_curso_id inválido'),
  body('carga_horaria')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 200 })
    .withMessage('carga_horaria inválida'),
  body('fecha_asignacion')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('fecha_asignacion inválida'),
  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),
  body('motivo').optional({ nullable: true }).isString().withMessage('motivo debe ser texto'),
];

export const listAsignacionesDocentesValidator = [];
