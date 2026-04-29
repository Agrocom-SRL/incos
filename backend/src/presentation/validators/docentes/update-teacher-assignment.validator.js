import { body } from 'express-validator';

/**
 * Body para PATCH /docentes/asignaciones/:id
 */
export const updateTeacherAssignmentValidator = [
  body('cursoId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('cursoId debe ser un entero positivo'),

  body('docenteId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('docenteId debe ser un entero positivo'),

  body('cargaHoraria')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 200 })
    .withMessage('cargaHoraria debe ser un entero entre 0 y 200'),

  body('vigente').optional({ nullable: true }).isBoolean().withMessage('vigente debe ser booleano'),

  body('motivo')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage('motivo debe ser texto (máx 1000 caracteres)'),

  body('fechaAsignacion')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('fechaAsignacion debe tener formato YYYY-MM-DD'),

  body().custom((value) => {
    const hasAnyField =
      value &&
      typeof value === 'object' &&
      ['cursoId', 'docenteId', 'cargaHoraria', 'vigente', 'motivo', 'fechaAsignacion'].some((k) =>
        Object.prototype.hasOwnProperty.call(value, k)
      );
    if (!hasAnyField) {
      throw new Error('Debe enviar al menos un campo editable de asignación');
    }
    return true;
  }),
];

