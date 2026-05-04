import { body } from 'express-validator';

/**
 * PATCH /api/v1/cursos/:id
 * Al menos uno de: codigo, colorHex, cupoMaximo, cupoMinimo
 */
export const patchCursoOfertaValidator = [
  body('parallelId').optional().isInt({ min: 1 }).withMessage('parallelId debe ser entero > 0').toInt(),
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
  body('colorHex').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('colorHex debe ser #RRGGBB (6 hex)'),
  body().custom((value) => {
    const v = value || {};
    const has =
      v.codigo !== undefined ||
      v.colorHex !== undefined ||
      v.cupoMaximo !== undefined ||
      v.cupoMinimo !== undefined;
    if (!has) {
      throw new Error('Enviá al menos uno de: codigo, colorHex, cupoMaximo, cupoMinimo');
    }
    return true;
  }),
];
