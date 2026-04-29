import { param } from 'express-validator';

export const cursoIdParamValidator = [
  param('cursoId')
    .notEmpty()
    .withMessage('cursoId es requerido')
    .isInt({ min: 1 })
    .withMessage('cursoId debe ser un entero mayor a 0')
    .toInt(),
];
