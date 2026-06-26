import { param } from 'express-validator';

/**
 * GET /calificaciones/centralizador/:paraleloGestionId/estudiante/:estudianteId/boletin
 * Params: paraleloGestionId (entero positivo), estudianteId (entero positivo).
 */
export const exportBoletinEstudianteValidator = [
  param('paraleloGestionId')
    .exists({ checkNull: true })
    .withMessage('paraleloGestionId es requerido')
    .bail()
    .isInt({ min: 1 })
    .withMessage('paraleloGestionId debe ser un entero positivo'),
  param('estudianteId')
    .exists({ checkNull: true })
    .withMessage('estudianteId es requerido')
    .bail()
    .isInt({ min: 1 })
    .withMessage('estudianteId debe ser un entero positivo')
];
