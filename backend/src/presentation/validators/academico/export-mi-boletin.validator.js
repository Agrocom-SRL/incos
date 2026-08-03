import { query } from 'express-validator';

/**
 * GET /calificaciones/mi-boletin/pdf
 * Query: bimestre (opcional, 1..4). Sin él se exporta el boletín ANUAL; con él,
 * el boletín BIMESTRAL de ese parcial. Mismo rango que el resto del módulo.
 */
export const exportMiBoletinPdfValidator = [
  query('bimestre')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('bimestre debe ser un entero entre 1 y 4')
];
