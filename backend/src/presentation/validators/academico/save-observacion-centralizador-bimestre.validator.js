import { body, param } from 'express-validator';

/**
 * PUT /calificaciones/centralizador/:paraleloGestionId/bimestre/:bimestre/observaciones/:estudianteId
 */
export const saveObservacionCentralizadorBimestreValidator = [
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
    .withMessage('bimestre debe ser un entero entre 1 y 4'),
  param('estudianteId')
    .exists({ checkNull: true })
    .withMessage('estudianteId es requerido')
    .bail()
    .isInt({ min: 1 })
    .withMessage('estudianteId debe ser un entero positivo'),
  body('observacion')
    .optional({ nullable: true })
    .isString()
    .withMessage('observacion debe ser texto')
    .bail()
    .isLength({ max: 2000 })
    .withMessage('observacion no puede superar 2000 caracteres'),
];
