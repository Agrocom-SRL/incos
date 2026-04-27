import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

export const listCursosDisponiblesDocenteValidator = [
  ...listValidator,
  query('gestionPlanId')
    .notEmpty()
    .withMessage('gestionPlanId es requerido')
    .isInt({ min: 1 })
    .withMessage('gestionPlanId debe ser un entero positivo'),
];
