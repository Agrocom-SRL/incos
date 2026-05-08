import { body } from 'express-validator';

export const patchAulaHorarioValidator = [
  body('aulaId')
    .custom((value) => value === null || (Number.isFinite(Number(value)) && Number(value) > 0))
    .withMessage('aulaId debe ser número positivo o null'),
];

