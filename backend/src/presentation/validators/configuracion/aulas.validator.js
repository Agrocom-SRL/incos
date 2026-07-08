import { body, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import { CATEGORIAS_AULA_VALUES } from '../../../domain/constants/cursos.constants.js';

/**
 * Validators de Aulas (catálogo maestro de espacios físicos)
 *
 * Shape: codigo (VARCHAR 20), nombre (VARCHAR 100), categoria (ENUM), capacidad
 * (INT), observaciones (TEXT opcional). Distinto de discapacidad/idiomas por
 * tener categoria+capacidad, por eso no reutiliza el validator genérico
 * nombre-descripcion.
 */
export const listAulasValidator = [
  ...listValidator,
  query('categoria')
    .optional()
    .isIn(CATEGORIAS_AULA_VALUES)
    .withMessage(`categoria debe ser uno de: ${CATEGORIAS_AULA_VALUES.join(', ')}`),
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];

export const createAulaValidator = [
  body('codigo')
    .notEmpty()
    .withMessage('codigo es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('codigo debe tener entre 1 y 20 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('nombre es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),
  body('categoria')
    .optional()
    .isIn(CATEGORIAS_AULA_VALUES)
    .withMessage(`categoria debe ser uno de: ${CATEGORIAS_AULA_VALUES.join(', ')}`),
  body('capacidad')
    .optional()
    .isInt({ min: 0 })
    .withMessage('capacidad debe ser un número entero mayor o igual a 0'),
  body('observaciones')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('observaciones no debe superar los 2000 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateAulaValidator = [
  body('codigo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('codigo debe tener entre 1 y 20 caracteres'),
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nombre debe tener entre 2 y 100 caracteres'),
  body('categoria')
    .optional()
    .isIn(CATEGORIAS_AULA_VALUES)
    .withMessage(`categoria debe ser uno de: ${CATEGORIAS_AULA_VALUES.join(', ')}`),
  body('capacidad')
    .optional()
    .isInt({ min: 0 })
    .withMessage('capacidad debe ser un número entero mayor o igual a 0'),
  body('observaciones')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('observaciones no debe superar los 2000 caracteres'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
