import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

export const listPlanesDocenteValidator = [
  ...listValidator,
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
];
