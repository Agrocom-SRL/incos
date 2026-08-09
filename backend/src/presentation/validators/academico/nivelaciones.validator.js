import { body, param, query } from 'express-validator';
import {
  TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES,
  TIPOS_INTENTO_ACADEMICO_VALUES,
  TIPOS_DECISION_ADMINISTRATIVA_VALUES,
} from '../../../domain/constants/inscripciones.constants.js';
import { ESTADOS_NIVELACION_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

const levelingIdParam = param('levelingId').isInt({ min: 1 }).withMessage('Nivelación inválida');

/** Ancla mutuamente excluyente: subjectEnrollmentId, o enrollmentId+planSubjectId. */
const anclaBody = [
  body('subjectEnrollmentId').optional({ nullable: true }).isInt({ min: 1 }),
  body('enrollmentId').optional({ nullable: true }).isInt({ min: 1 }),
  body('planSubjectId').optional({ nullable: true }).isInt({ min: 1 }),
];

export const listHistorialMatriculaParaleloValidator = [
  query('paraleloGestionId').isInt({ min: 1 }).withMessage('El paralelo es obligatorio'),
];

export const registrarEventoHistorialMatriculaValidator = [
  ...anclaBody,
  body('stateType')
    .isIn(TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES)
    .withMessage('stateType inválido'),
  body('transitionDate').optional({ nullable: true }).isISO8601(),
  body('resultingGrade').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body('forcedGrade').optional({ nullable: true }).isBoolean(),
  body('observations').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];

export const registrarDecisionAdministrativaValidator = [
  body('subjectEnrollmentId').isInt({ min: 1 }).withMessage('subjectEnrollmentId es obligatorio'),
  body('stateType')
    .isIn(TIPOS_DECISION_ADMINISTRATIVA_VALUES)
    .withMessage(`stateType debe ser uno de: ${TIPOS_DECISION_ADMINISTRATIVA_VALUES.join(', ')}`),
  body('resultingGrade')
    .isFloat({ min: 0, max: 100 })
    .withMessage('resultingGrade es obligatorio (0-100)'),
  body('transitionDate').optional({ nullable: true }).isISO8601(),
  body('observations').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];

export const programarNivelacionValidator = [
  ...anclaBody,
  body('stateType')
    .isIn(TIPOS_INTENTO_ACADEMICO_VALUES)
    .withMessage(`stateType debe ser uno de: ${TIPOS_INTENTO_ACADEMICO_VALUES.join(', ')}`),
  body('transitionDate').optional({ nullable: true }).isISO8601(),
  body('observations').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('managementId').optional({ nullable: true }).isInt({ min: 1 }),
  body('evaluatorTeacherId').optional({ nullable: true }).isInt({ min: 1 }),
  body('examDate').optional({ nullable: true }).isISO8601(),
];

export const registrarResultadoNivelacionValidator = [
  levelingIdParam,
  body('status').isIn(ESTADOS_NIVELACION_VALUES).withMessage('status inválido'),
  body('levelingGrade').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body('passed').optional({ nullable: true }).isBoolean(),
  body('observations').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];
