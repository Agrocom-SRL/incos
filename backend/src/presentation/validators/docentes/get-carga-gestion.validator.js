import { query } from 'express-validator';
import { idValidator } from '../common/id.validator.js';

export const getDocenteCargaGestionValidator = [
  ...idValidator,
  query('gestion_id')
    .notEmpty()
    .withMessage('gestion_id es requerido')
    .isInt({ min: 1 })
    .withMessage('gestion_id debe ser un entero positivo'),
];
