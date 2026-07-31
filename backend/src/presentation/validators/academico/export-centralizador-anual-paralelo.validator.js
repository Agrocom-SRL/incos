import { param } from 'express-validator';

/**
 * GET /calificaciones/centralizador/:paraleloGestionId/anual/export
 * Params: paraleloGestionId (entero positivo).
 */
export const exportCentralizadorAnualParaleloValidator = [
  param('paraleloGestionId')
    .exists({ checkNull: true })
    .withMessage('paraleloGestionId es requerido')
    .bail()
    .isInt({ min: 1 })
    .withMessage('paraleloGestionId debe ser un entero positivo'),
];
