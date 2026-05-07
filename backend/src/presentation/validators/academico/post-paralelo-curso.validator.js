import { body } from 'express-validator';

/**
 * POST /api/v1/paralelos/:id/cursos
 * Crea un curso en el paralelo para una asignatura del plan.
 */
export const postParaleloCursoValidator = [
  body('asignaturaPlanId')
    .exists()
    .withMessage('asignaturaPlanId es requerido')
    .isInt({ min: 1 })
    .withMessage('asignaturaPlanId debe ser entero > 0')
    .toInt(),
  body('codigo').optional().isString().isLength({ min: 1, max: 50 }).withMessage('codigo admite 1–50 caracteres'),
  body('cupoMaximo')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('cupoMaximo debe ser entero entre 1 y 500')
    .toInt(),
  body('cupoMinimo')
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage('cupoMinimo debe ser entero entre 0 y 500')
    .toInt(),
  body('colorHex')
    .optional()
    .isString()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('colorHex debe ser #RRGGBB (6 hex)'),
];
