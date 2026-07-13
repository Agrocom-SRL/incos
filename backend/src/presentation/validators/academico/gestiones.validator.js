/**
 * Validators del recurso Gestiones (POST /gestiones, PUT /gestiones/:id)
 */
import { body, param } from 'express-validator';
import { TIPOS_GESTION_VALUES } from '../../../domain/constants/gestion.constants.js';

export const createGestionValidator = [
  body('codigo')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 20 }),
  body('nombre')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 100 }),
  body('anio').isInt({ min: 2000, max: 2100 }),
  body('tipo').isIn(TIPOS_GESTION_VALUES),
  body('fecha_inicio').isISO8601(),
  body('fecha_fin').isISO8601(),
];

// Edición parcial: todos los campos son opcionales, se actualiza solo lo enviado.
// `vigente` NO se valida ni se acepta: el use case lo ignora (marcar-vigente es aparte).
export const updateGestionValidator = [
  param('id').isInt({ min: 1 }),
  body('codigo')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 20 }),
  body('nombre')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 100 }),
  body('anio').optional().isInt({ min: 2000, max: 2100 }),
  body('tipo').optional().isIn(TIPOS_GESTION_VALUES),
  body('fecha_inicio').optional().isISO8601(),
  body('fecha_fin').optional().isISO8601(),
];
