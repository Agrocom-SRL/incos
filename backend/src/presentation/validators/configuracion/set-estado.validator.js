import { body } from 'express-validator';

/**
 * Validator compartido para PATCH /:id/estado de los catálogos maestros de
 * Recursos académicos (aulas, paralelos, tipos de evaluación).
 *
 * Réplica del patrón de validators/referencia/set-estado.validator.js
 * (catálogos complementarios) — se mantiene por módulo para respetar la
 * convención de carpetas de validators.
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
