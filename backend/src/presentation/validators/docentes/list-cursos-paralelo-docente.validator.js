import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

export const listCursosParaleloDocenteValidator = [
  ...listValidator,
  query('paraleloId')
    .notEmpty()
    .withMessage('paraleloId es requerido')
    .isInt({ min: 1 })
    .withMessage('paraleloId debe ser un entero positivo'),
];
