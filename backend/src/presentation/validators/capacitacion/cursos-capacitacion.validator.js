import { body, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import { ESTADOS_CAPACITACION_VALUES } from '../../../domain/constants/capacitacion.constants.js';

/**
 * Validators de Cursos de Capacitación (módulo CAP)
 *
 * Shape: titulo (VARCHAR 200), descripcion (TEXT opc), costo (DECIMAL Bs),
 * cupoMaximo (INT), aulaId (FK aulas opc), fechaInicio/fechaFin (DATE),
 * estado (ENUM propio), horarioIds (array de horarios.id, junction).
 */
export const listCursosCapacitacionValidator = [
  ...listValidator,
  query('estado')
    .optional()
    .isIn(ESTADOS_CAPACITACION_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`),
  query('incluirInactivos')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirInactivos debe ser true o false'),
];

export const createCursoCapacitacionValidator = [
  body('titulo')
    .notEmpty()
    .withMessage('titulo es requerido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('titulo debe tener entre 2 y 200 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('descripcion no debe superar los 5000 caracteres'),
  body('costo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('costo debe ser un número mayor o igual a 0'),
  body('cupoMaximo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cupoMaximo debe ser un entero mayor o igual a 1'),
  body('aulaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('aulaId debe ser un entero positivo'),
  body('fechaInicio')
    .notEmpty()
    .withMessage('fechaInicio es requerida')
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida (YYYY-MM-DD)'),
  body('fechaFin')
    .notEmpty()
    .withMessage('fechaFin es requerida')
    .isISO8601()
    .withMessage('fechaFin debe ser una fecha válida (YYYY-MM-DD)'),
  body('estado')
    .optional()
    .isIn(ESTADOS_CAPACITACION_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`),
  body('horarioIds')
    .optional()
    .isArray()
    .withMessage('horarioIds debe ser un array de IDs del catálogo de horarios'),
  body('horarioIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cada elemento de horarioIds debe ser un entero positivo'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];

export const updateCursoCapacitacionValidator = [
  body('titulo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('titulo debe tener entre 2 y 200 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('descripcion no debe superar los 5000 caracteres'),
  body('costo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('costo debe ser un número mayor o igual a 0'),
  body('cupoMaximo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cupoMaximo debe ser un entero mayor o igual a 1'),
  body('aulaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('aulaId debe ser un entero positivo'),
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida (YYYY-MM-DD)'),
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('fechaFin debe ser una fecha válida (YYYY-MM-DD)'),
  body('estado')
    .optional()
    .isIn(ESTADOS_CAPACITACION_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`),
  body('horarioIds')
    .optional({ nullable: true })
    .isArray()
    .withMessage('horarioIds debe ser un array de IDs del catálogo de horarios'),
  body('horarioIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cada elemento de horarioIds debe ser un entero positivo'),
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
