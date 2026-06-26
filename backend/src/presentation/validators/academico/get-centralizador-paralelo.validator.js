import { query } from 'express-validator';

/**
 * GET /calificaciones/centralizador
 * Query: paraleloGestionId (requerido, entero positivo)
 */
export const getCentralizadorParaleloValidator = [
  query('paraleloGestionId')
    .exists({ checkNull: true })
    .withMessage('paraleloGestionId es requerido')
    .bail()
    .isInt({ min: 1 })
    .withMessage('paraleloGestionId debe ser un entero positivo'),
];
