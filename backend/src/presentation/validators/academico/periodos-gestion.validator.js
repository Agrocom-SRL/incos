import { body, param } from 'express-validator';

/** Edición de fechas (inicio/fin) de un periodo/etapa de la gestión vigente. */
export const putPeriodoFechasValidator = [
  param('id').isInt({ min: 1 }).withMessage('Id de periodo inválido.'),
  body('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .bail()
    .isISO8601().withMessage('Fecha de inicio inválida.'),
  body('fechaFin')
    .notEmpty().withMessage('La fecha de fin es obligatoria.')
    .bail()
    .isISO8601().withMessage('Fecha de fin inválida.'),
  body().custom((value) => {
    if (value.fechaFin && value.fechaInicio && String(value.fechaFin) < String(value.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la de inicio.');
    }
    return true;
  }),
];

/** Alta de una etapa (periodo) adicional en la gestión vigente. */
export const postPeriodoEtapaValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre de la etapa es obligatorio.')
    .bail()
    .isString().trim()
    .isLength({ max: 100 }).withMessage('El nombre no debe superar 100 caracteres.'),
  body('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .bail()
    .isISO8601().withMessage('Fecha de inicio inválida.'),
  body('fechaFin')
    .notEmpty().withMessage('La fecha de fin es obligatoria.')
    .bail()
    .isISO8601().withMessage('Fecha de fin inválida.'),
  body('division').optional({ nullable: true }).isString().trim(),
  body('colorHex')
    .optional({ nullable: true })
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color inválido (formato #RRGGBB).'),
  body().custom((value) => {
    if (value.fechaFin && value.fechaInicio && String(value.fechaFin) < String(value.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la de inicio.');
    }
    return true;
  }),
];

/** Validación de :id de periodo para eliminar. */
export const periodoIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Id de periodo inválido.'),
];
