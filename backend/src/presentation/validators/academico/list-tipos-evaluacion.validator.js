import { query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';

const AMBITOS_VALIDOS = ['BIMESTRE', 'MATERIA_COMPLETA'];

export const listTiposEvaluacionValidator = [
  ...listValidator,
  query('ambito')
    .optional()
    .isIn(AMBITOS_VALIDOS)
    .withMessage('ambito debe ser BIMESTRE o MATERIA_COMPLETA'),
];
