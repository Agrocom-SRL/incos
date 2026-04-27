import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

export const listParalelosDocenteValidator = [
  ...listValidator,
  query('gestionPlanId')
    .notEmpty()
    .withMessage('gestionPlanId es requerido')
    .isInt({ min: 1 })
    .withMessage('gestionPlanId debe ser un entero positivo'),
  query('periodoId')
    .notEmpty()
    .withMessage('periodoId es requerido')
    .isInt({ min: 1 })
    .withMessage('periodoId debe ser un entero positivo'),
];
