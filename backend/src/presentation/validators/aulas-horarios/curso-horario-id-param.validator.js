import { param } from 'express-validator';

export const cursoHorarioIdParamValidator = [
  param('cursoHorarioId').isInt({ min: 1 }).withMessage('cursoHorarioId debe ser entero > 0').toInt(),
];
