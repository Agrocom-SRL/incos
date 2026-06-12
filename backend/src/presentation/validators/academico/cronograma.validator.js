import { body, param } from 'express-validator';

/** Alta de actividad del cronograma. */
export const createActividadCronogramaValidator = [
  body('periodoAcademicoId')
    .notEmpty().withMessage('El periodo es obligatorio.')
    .bail()
    .isInt({ min: 1 }).withMessage('Periodo inválido.'),
  body('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .bail()
    .isISO8601().withMessage('Fecha de inicio inválida.'),
  body('fechaFin')
    .optional({ nullable: true })
    .isISO8601().withMessage('Fecha de fin inválida.'),
  body('actividadId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Actividad inválida.'),
  body('nombrePersonalizado')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 200 }).withMessage('El nombre no debe superar 200 caracteres.'),
  body().custom((value) => {
    if (!value.actividadId && !value.nombrePersonalizado) {
      throw new Error('Seleccione una actividad del catálogo o indique un nombre personalizado.');
    }
    if (value.fechaFin && value.fechaInicio && String(value.fechaFin) < String(value.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la de inicio.');
    }
    return true;
  }),
];

/** Edición de actividad del cronograma. */
export const updateActividadCronogramaValidator = [
  param('id').isInt({ min: 1 }).withMessage('Id inválido.'),
  body('periodoAcademicoId').optional().isInt({ min: 1 }).withMessage('Periodo inválido.'),
  body('fechaInicio').optional().isISO8601().withMessage('Fecha de inicio inválida.'),
  body('fechaFin').optional({ nullable: true }).isISO8601().withMessage('Fecha de fin inválida.'),
  body('actividadId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Actividad inválida.'),
  body('nombrePersonalizado')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 200 }).withMessage('El nombre no debe superar 200 caracteres.'),
  body().custom((value) => {
    if (value.fechaFin && value.fechaInicio && String(value.fechaFin) < String(value.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la de inicio.');
    }
    return true;
  }),
];

/** Validación de :id para eliminar. */
export const cronogramaIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Id inválido.'),
];
