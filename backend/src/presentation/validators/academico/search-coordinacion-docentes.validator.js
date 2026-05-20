import { query } from 'express-validator';

/**
 * GET /calificaciones/coordinacion/docentes
 * Query: q (min 2 si preliminar no es 1), limit (opcional), preliminar=1
 */
export const searchCoordinacionDocentesValidator = [
  query('q').custom((value, { req }) => {
    const prelim = req.query?.preliminar === '1';
    const q = value != null && value !== '' ? String(value).trim() : '';
    if (prelim) return true;
    if (q.length > 0 && q.length < 2) {
      throw new Error('q debe tener al menos 2 caracteres, salvo cuando preliminar=1');
    }
    if (q.length > 120) {
      throw new Error('q no puede superar 120 caracteres');
    }
    return true;
  }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un entero entre 1 y 100'),
  query('preliminar')
    .optional()
    .isIn(['0', '1'])
    .withMessage('preliminar debe ser 0 o 1'),
];
