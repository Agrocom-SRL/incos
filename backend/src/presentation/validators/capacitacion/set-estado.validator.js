import { body } from 'express-validator';

/**
 * Validator para PATCH /:id/estado de cursos de capacitación (toggle de
 * `activo`, patrón EstadoTogglePill).
 *
 * Réplica del patrón de validators/configuracion/set-estado.validator.js — se
 * mantiene por módulo para respetar la convención de carpetas de validators.
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
