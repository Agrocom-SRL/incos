import { body, param, query } from 'express-validator';
import { listValidator } from '../common/list.validator.js';
import {
  MODALIDADES_SESION_REFORZAMIENTO_VALUES,
  ESTADOS_SESION_REFORZAMIENTO_VALUES,
  ORIGENES_PARTICIPANTE_SESION_VALUES,
  PROGRESOS_PARTICIPANTE_SESION_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Validators del sub-módulo Acompañamiento (módulo TUT):
 * alertas de riesgo (vista 156, sin tabla), sesiones de reforzamiento y panel.
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

export const listSesionesReforzamientoValidator = [
  ...listValidator,
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
  query('docenteId').optional().isInt({ min: 1 }).withMessage('docenteId debe ser un entero positivo'),
  query('asignacionDocenteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('asignacionDocenteId debe ser un entero positivo'),
  query('estado')
    .optional()
    .isIn(ESTADOS_SESION_REFORZAMIENTO_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_SESION_REFORZAMIENTO_VALUES.join(', ')}`),
  query('modalidad')
    .optional()
    .isIn(MODALIDADES_SESION_REFORZAMIENTO_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_SESION_REFORZAMIENTO_VALUES.join(', ')}`),
];

const participanteFieldValidators = (prefix) => [
  body(`${prefix}.matriculaMateriaId`)
    .notEmpty()
    .withMessage('cada participante requiere matriculaMateriaId')
    .isInt({ min: 1 })
    .withMessage('matriculaMateriaId debe ser un entero positivo'),
  body(`${prefix}.origen`)
    .optional()
    .isIn(ORIGENES_PARTICIPANTE_SESION_VALUES)
    .withMessage(`origen debe ser uno de: ${ORIGENES_PARTICIPANTE_SESION_VALUES.join(', ')}`),
];

export const createSesionReforzamientoValidator = [
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
    .isIn(MODALIDADES_SESION_REFORZAMIENTO_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_SESION_REFORZAMIENTO_VALUES.join(', ')}`),
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
  body('participantes').optional().isArray().withMessage('participantes debe ser un array'),
  ...participanteFieldValidators('participantes.*'),
];

export const updateSesionReforzamientoValidator = [
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
    .isIn(MODALIDADES_SESION_REFORZAMIENTO_VALUES)
    .withMessage(`modalidad debe ser una de: ${MODALIDADES_SESION_REFORZAMIENTO_VALUES.join(', ')}`),
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
    .isIn(ESTADOS_SESION_REFORZAMIENTO_VALUES)
    .withMessage(`estado debe ser uno de: ${ESTADOS_SESION_REFORZAMIENTO_VALUES.join(', ')}`),
  body('observaciones').optional({ nullable: true }).isString(),
];

export const registerAsistenciaSesionValidator = [
  body('participantes')
    .isArray()
    .withMessage('participantes debe ser un array (puede ser vacío para retirar a todos)'),
  ...participanteFieldValidators('participantes.*'),
  body('participantes.*.asistio')
    .optional({ nullable: true })
    .isBoolean()
    .withMessage('asistio debe ser boolean'),
  body('participantes.*.progreso')
    .optional()
    .isIn(PROGRESOS_PARTICIPANTE_SESION_VALUES)
    .withMessage(`progreso debe ser uno de: ${PROGRESOS_PARTICIPANTE_SESION_VALUES.join(', ')}`),
  body('participantes.*.observaciones').optional({ nullable: true }).isString(),
];

export const panelAcompanamientoValidator = [
  query('gestionId').optional().isInt({ min: 1 }).withMessage('gestionId debe ser un entero positivo'),
];
