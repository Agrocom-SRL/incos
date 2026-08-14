import { query } from 'express-validator';

/**
 * GET /estudiantes/buscar-para-inscripcion
 * Query:
 * - q (min 2 si preliminar/solo_nuevos no es 1)
 * - limit (opcional; default 50, o 10 con solo_nuevos=1)
 * - preliminar=1 (muestra sin q)
 * - solo_nuevos=1 (solo estudiantes con total_inscripciones = 0; sin mínimo de
 *   caracteres, orden created_at DESC)
 */
export const searchStudentsInscripcionValidator = [
  query('q').custom((value, { req }) => {
    const sinMinimo = req.query?.preliminar === '1' || req.query?.solo_nuevos === '1';
    const q = value != null && value !== '' ? String(value).trim() : '';
    if (q.length > 120) {
      throw new Error('q no puede superar 120 caracteres');
    }
    if (sinMinimo) return true;
    if (q.length < 2) {
      throw new Error('q debe tener al menos 2 caracteres, salvo cuando preliminar=1 o solo_nuevos=1');
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
  query('solo_nuevos')
    .optional()
    .isIn(['0', '1'])
    .withMessage('solo_nuevos debe ser 0 o 1'),
];
