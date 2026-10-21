import { query } from 'express-validator';
import { listValidator } from '../common/index.js';

export const listAulasHorariosValidator = [
  ...listValidator,
  query('dia')
    .optional()
    .isIn(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'])
    .withMessage('dia inválido'),
  query('turno').optional().isIn(['TARDE', 'NOCHE']).withMessage('turno inválido'),
  query('aula_id').optional().isInt({ min: 1 }).withMessage('aula_id debe ser entero > 0').toInt(),
];
