import { body, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import {
  ESTADOS_CAPACITACION_VALUES,
  MODALIDADES_CAPACITACION_VALUES,
} from '../../../domain/constants/capacitacion.constants.js';
import { DIAS_SEMANA_VALUES } from '../../../domain/constants/cursos.constants.js';

/**
 * Validators de Cursos de Capacitación (módulo CAP)
 *
 * Shape: titulo (VARCHAR 200), descripcion (TEXT opc), costo (DECIMAL Bs),
 * cupoMaximo (INT), fechaInicio/fechaFin (DATE),
 * estado (ENUM propio), grupos[] (con aulaId opcional y horarios[].horarioId).
 * Extensión: costoMatricula, entidadCertificadora, modalidad, nivel, dirigidoA,
 * duracion, interruptores tieneCosto/cobraMatricula, grupos[] con sus horarios y
 * requisitos[] (fechaFin es opcional). La coherencia
 * fina (fechas, ids del curso) vive en el use case.
 */

const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/** Campos nuevos del curso, comunes a crear y editar (todos opcionales). */
const gruposValidators = [
  body('grupos')
    .optional({ nullable: true })
    .isArray({ max: 10 })
    .withMessage('grupos debe ser un array de hasta 10 grupos'),
  body('grupos.*.id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('grupos[].id debe ser un entero positivo'),
  body('grupos.*.nombre')
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('grupos[].nombre es requerido (máx. 60 caracteres)'),
  body('grupos.*.aulaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('grupos[].aulaId debe ser un entero positivo'),
  body('grupos.*.cupoMaximo')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('grupos[].cupoMaximo debe ser un entero positivo'),
  body('grupos.*.orden')
    .optional()
    .isInt({ min: 1 })
    .withMessage('grupos[].orden debe ser un entero positivo'),
  body('grupos.*.horarios')
    .optional({ nullable: true })
    .isArray({ max: 20 })
    .withMessage('grupos[].horarios debe ser un array'),
  body('grupos.*.horarios.*.horarioId')
    .isInt({ min: 1 })
    .withMessage('grupos[].horarios[].horarioId debe ser un entero positivo'),
];

const extensionCursoValidators = [
  body('tieneCosto').optional().isBoolean().withMessage('tieneCosto debe ser boolean'),
  body('cobraMatricula').optional().isBoolean().withMessage('cobraMatricula debe ser boolean'),
  body('costoMatricula')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('costoMatricula debe ser un número mayor o igual a 0'),
  body('entidadCertificadora')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('entidadCertificadora no debe superar los 150 caracteres'),
  body('modalidad')
    .optional()
    .isIn(MODALIDADES_CAPACITACION_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_CAPACITACION_VALUES.join(', ')}`),
  body('nivel')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 60 })
    .withMessage('nivel no debe superar los 60 caracteres'),
  body('dirigidoA')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('dirigidoA no debe superar los 255 caracteres'),
  body('duracion')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 60 })
    .withMessage('duracion no debe superar los 60 caracteres'),
  body('requisitos')
    .optional({ nullable: true })
    .isArray({ max: 50 })
    .withMessage('requisitos debe ser un array de hasta 50 requisitos'),
  body('requisitos.*.id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('requisitos[].id debe ser un entero positivo'),
  body('requisitos.*.descripcion')
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('requisitos[].descripcion es requerida (máx. 255 caracteres)'),
  body('requisitos.*.obligatorio')
    .optional()
    .isBoolean()
    .withMessage('requisitos[].obligatorio debe ser boolean'),
  body('requisitos.*.orden')
    .optional()
    .isInt({ min: 1 })
    .withMessage('requisitos[].orden debe ser un entero positivo'),
];
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

export const listGruposCapacitacionValidator = [
  ...listValidator,
  query('cursoId').optional().isInt({ min: 1 }).withMessage('cursoId debe ser un entero positivo'),
  query('estado')
    .optional()
    .isIn(ESTADOS_CAPACITACION_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_CAPACITACION_VALUES.join(', ')}`),
];

export const listHorariosCapacitacionValidator = [
  query('aulaId').optional().isInt({ min: 1 }).withMessage('aulaId debe ser un entero positivo'),
  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('search no debe superar los 100 caracteres'),
  query('sort')
    .optional()
    .matches(/^(dia|hora|nombre)(:(asc|desc))?$/i)
    .withMessage('sort debe ser dia, hora o nombre (opcional :asc o :desc)'),
  query('excludeCursoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('excludeCursoId debe ser un entero positivo'),
];

/** Cuerpo de un horario de capacitación (crear y editar). */
export const horarioCapacitacionBodyValidator = [
  body('dia')
    .notEmpty()
    .withMessage('dia es requerido')
    .toUpperCase()
    .isIn(DIAS_SEMANA_VALUES)
    .withMessage(`dia debe ser uno de: ${DIAS_SEMANA_VALUES.join(', ')}`),
  body('horaInicio')
    .notEmpty()
    .withMessage('horaInicio es requerida')
    .matches(HORA)
    .withMessage('horaInicio debe tener formato HH:MM'),
  body('horaFin')
    .notEmpty()
    .withMessage('horaFin es requerida')
    .matches(HORA)
    .withMessage('horaFin debe tener formato HH:MM'),
];

export const createHorarioCapacitacionValidator = horarioCapacitacionBodyValidator;
export const updateHorarioCapacitacionValidator = horarioCapacitacionBodyValidator;

export const listHorariosDisponiblesCapacitacionValidator = [
  query('aulaId')
    .notEmpty()
    .withMessage('aulaId es requerido')
    .isInt({ min: 1 })
    .withMessage('aulaId debe ser un entero positivo'),
  query('excludeCursoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('excludeCursoId debe ser un entero positivo'),
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
  body('fechaInicio')
    .notEmpty()
    .withMessage('fechaInicio es requerida')
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida (YYYY-MM-DD)'),
  body('fechaFin')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('fechaFin debe ser una fecha válida (YYYY-MM-DD)'),
  ...gruposValidators,
  ...extensionCursoValidators,
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
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe ser una fecha válida (YYYY-MM-DD)'),
  body('fechaFin')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('fechaFin debe ser una fecha válida (YYYY-MM-DD)'),
  ...gruposValidators,
  ...extensionCursoValidators,
  body('activo').optional().isBoolean().withMessage('activo debe ser boolean'),
];
