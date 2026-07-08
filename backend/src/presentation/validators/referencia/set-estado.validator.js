import { body } from 'express-validator';

/**
 * Validator compartido para PATCH /:id/estado de los catálogos complementarios
 * (discapacidad, tipos-parentesco, idiomas, estados-civiles).
 *
 * Body esperado: { "activo": boolean }
 */
export const setEstadoCatalogoValidator = [
  body('activo')
    .exists({ checkNull: true })
    .withMessage('activo es requerido')
    .isBoolean()
    .withMessage('activo debe ser boolean'),
];
