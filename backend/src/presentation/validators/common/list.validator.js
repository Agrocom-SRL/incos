import { query } from 'express-validator';

/**
 * Validador genérico para operaciones de listado (GET)
 * 
 * Valida los parámetros comunes de query para todos los endpoints de listado:
 * - page: Número de página (paginación)
 * - limit: Cantidad de resultados por página
 * - search: Término de búsqueda general
 * 
 * Este validador se usa en todos los módulos para operaciones de listado básicas.
 * Si un módulo requiere validaciones adicionales, puede extender este validador.
 * 
 * Ubicación: presentation/validators/common (validators compartidos)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo valida parámetros comunes de listado
 * - DRY: Evita duplicación de código entre módulos
 * 
 * @example
 * import { listValidator } from '../validators/common/list.validator.js';
 * router.get('/', listValidator, validateRequest, controller);
 */
export const listValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('El límite debe ser un número entre 1 y 10000'),

  query('incluir_estadisticas')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluir_estadisticas debe ser true o false'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres'),
];

