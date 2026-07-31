import { body, param, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import {
  MODALIDADES_SESION_REFUERZO_VALUES,
  ESTADOS_SESION_REFUERZO_VALUES,
  ORIGENES_ESTUDIANTE_SESION_VALUES,
  PROGRESOS_ESTUDIANTE_SESION_VALUES,
} from '../../../domain/constants/academico.acompanamiento.constants.js';

/**
 * Validators del sub-módulo Acompañamiento (módulo ACA):
 * alertas de riesgo (vista 156, sin tabla), sesiones de refuerzo y panel.
 */

/** Param :estudianteId (detalle de alerta por estudiante). */
export const estudianteIdParamValidator = [
  param('estudianteId')
    .notEmpty()
    .withMessage('El ID del estudiante es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero mayor a 0')
    .toInt(),
];

export const listAlertasRiesgoValidator = [
  ...listValidator,
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('carreraId').optional().isInt({ min: 1 }).withMessage('carreraId debe ser un entero positivo'),
  query('paraleloGestionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('paraleloGestionId debe ser un entero positivo'),
  query('incluirSinRiesgo')
    .optional()
    .isIn(['true', 'false', '0', '1'])
    .withMessage('incluirSinRiesgo debe ser true o false'),
];

export const alertaEstudianteValidator = [
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
];

export const listSesionesRefuerzoValidator = [
  ...listValidator,
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('docenteId').optional().isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  query('asignacionDocenteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('asignacionDocenteId debe ser un entero positivo'),
  query('estado')
    .optional()
    .isIn(ESTADOS_SESION_REFUERZO_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_SESION_REFUERZO_VALUES.join(', ')}`),
  query('modalidad')
    .optional()
    .isIn(MODALIDADES_SESION_REFUERZO_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_SESION_REFUERZO_VALUES.join(', ')}`),
];

const estudianteFieldValidators = (prefix) => [
  body(`${prefix}.matriculaMateriaId`)
    .notEmpty()
    .withMessage('cada estudiante requiere matriculaMateriaId')
    .isInt({ min: 1 })
    .withMessage('matriculaMateriaId debe ser un entero positivo'),
  body(`${prefix}.origen`)
    .optional()
    .isIn(ORIGENES_ESTUDIANTE_SESION_VALUES)
    .withMessage(`origen debe ser uno de: ${ORIGENES_ESTUDIANTE_SESION_VALUES.join(', ')}`),
];

export const createSesionRefuerzoValidator = [
  body('asignacionDocenteId')
    .notEmpty()
    .withMessage('asignacionDocenteId es requerido')
    .isInt({ min: 1 })
    .withMessage('asignacionDocenteId debe ser un entero positivo'),
  body('fecha')
    .notEmpty()
    .withMessage('fecha es requerida')
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('horaInicio')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('horaInicio debe tener formato HH:mm'),
  body('horaFin')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('horaFin debe tener formato HH:mm'),
  body('modalidad')
    .optional()
    .isIn(MODALIDADES_SESION_REFUERZO_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_SESION_REFUERZO_VALUES.join(', ')}`),
  body('aulaId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('aulaId debe ser un entero positivo'),
  body('enlaceVirtual')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('enlaceVirtual no debe superar los 500 caracteres'),
  body('tema')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('tema no debe superar los 255 caracteres'),
  body('observaciones').optional({ nullable: true }).isString(),
  body('estudiantes').optional().isArray().withMessage('estudiantes debe ser un array'),
  ...estudianteFieldValidators('estudiantes.*'),
];

export const updateSesionRefuerzoValidator = [
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('fecha debe ser una fecha válida (YYYY-MM-DD)'),
  body('horaInicio')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('horaInicio debe tener formato HH:mm'),
  body('horaFin')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('horaFin debe tener formato HH:mm'),
  body('modalidad')
    .optional()
    .isIn(MODALIDADES_SESION_REFUERZO_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_SESION_REFUERZO_VALUES.join(', ')}`),
  body('aulaId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('aulaId debe ser un entero positivo'),
  body('enlaceVirtual')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('enlaceVirtual no debe superar los 500 caracteres'),
  body('tema')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('tema no debe superar los 255 caracteres'),
  body('estado')
    .optional()
    .isIn(ESTADOS_SESION_REFUERZO_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_SESION_REFUERZO_VALUES.join(', ')}`),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const registerAsistenciaSesionValidator = [
  body('estudiantes')
    .isArray()
    .withMessage('estudiantes debe ser un array (puede ser vacío para retirar a todos)'),
  ...estudianteFieldValidators('estudiantes.*'),
  body('estudiantes.*.asistio')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('asistio debe ser boolean'),
  body('estudiantes.*.progreso')
    .optional()
    .isIn(PROGRESOS_ESTUDIANTE_SESION_VALUES)
    .withMessage(`progreso debe ser uno de: ${PROGRESOS_ESTUDIANTE_SESION_VALUES.join(', ')}`),
  body('estudiantes.*.observaciones').optional({ nullable: true }).isString(),
];

export const panelAcompanamientoValidator = [
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
];
