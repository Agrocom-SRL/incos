import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

export const listTiposEvaluacionValidator = [
  ...listValidator,
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];
