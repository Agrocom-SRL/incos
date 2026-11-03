/**
 * Validator común para búsqueda por texto libre
 *
 * Valida el query parameter 'query' para búsquedas generales en múltiples campos.
 * Este validator es genérico y puede ser usado en cualquier módulo que necesite
 * búsqueda por texto libre.
 *
 * El sistema buscará en los campos definidos en el método getSearchFields()
 * del repositorio correspondiente.
 */

import { query } from 'express-validator';

/**
 * Validator para búsqueda general por texto libre
 *
 * Reglas:
 * - Debe proporcionar un término de búsqueda (parámetro 'query')
 * - El término debe tener al menos 2 caracteres (para evitar búsquedas muy amplias)
 * - El término puede tener hasta 255 caracteres
 * - El límite de resultados es opcional (parámetro 'limit'), entre 1 y 50 (default: 50)
 *
 * Ejemplos de uso:
 * - GET /api/v1/{recurso}/search?query=termino
 * - GET /api/v1/{recurso}/search?query=texto libre&limit=10
 */
export const searchValidator = [
  // Término de búsqueda: requerido, texto libre
  query('query')
    .isString()
    .withMessage('El término de búsqueda debe ser texto')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('El término de búsqueda es requerido y no puede estar vacío')
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage('El término de búsqueda debe tener entre 2 y 255 caracteres'),

  // Límite de resultados: opcional, entre 1 y 50
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entero entre 1 y 50')
    .toInt(),
];
