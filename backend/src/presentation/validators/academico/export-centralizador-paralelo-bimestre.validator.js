import { param } from 'express-validator';

/**
 * GET /calificaciones/centralizador/:paraleloGestionId/bimestre/:bimestre/export
 * Params: paraleloGestionId (entero positivo), bimestre (1..4).
 */
export const exportCentralizadorParaleloBimestreValidator = [
  param('paraleloGestionId')
    .exists({ checkNull: true })
    .withMessage('paraleloGestionId es requerido')
    .bail()
    .isInt({ min: 1 })
    .withMessage('paraleloGestionId debe ser un entero positivo'),
  param('bimestre')
    .exists({ checkNull: true })
    .withMessage('bimestre es requerido')
    .bail()
    .isInt({ min: 1, max: 4 })
    .withMessage('bimestre debe ser un entero entre 1 y 4')
];
