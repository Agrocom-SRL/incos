import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

export const listCursosParaleloDocenteValidator = [
  ...listValidator,
  query('paraleloId')
    .notEmpty()
    .withMessage('paraleloId es requerido')
    .isInt({ min: 1 })
    .withMessage('paraleloId debe ser un entero positivo'),
  query('gestionPlanId')
    .notEmpty()
    .withMessage('gestionPlanId es requerido')
    .isInt({ min: 1 })
    .withMessage('gestionPlanId debe ser un entero positivo'),
  query('paraleloGestionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('paraleloGestionId debe ser un entero positivo'),
];
