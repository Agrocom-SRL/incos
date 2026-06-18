import { body, param, query } from 'express-validator';
import {
  MOTIVOS_LICENCIAS_VALUES,
  ESTADOS_LICENCIAS_VALUES,
} from '../../../domain/constants/licencias.constants.js';

const idParam = param('id').isInt({ min: 1 }).withMessage('Licencia inválida');

export const listarLicenciasValidator = [
  query('estado')
    .optional()
    .isIn(ESTADOS_LICENCIAS_VALUES)
    .withMessage('Estado de licencia inválido'),
];

export const getLicenciaByIdValidator = [idParam];

export const getInscripcionVigenteValidator = [
  query('estudianteId').isInt({ min: 1 }).withMessage('Estudiante inválido'),
];

export const crearLicenciaValidator = [
  body('inscripcionId').isInt({ min: 1 }).withMessage('Inscripción inválida'),
  body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fechaFin').isISO8601().withMessage('Fecha de fin inválida'),
  body('motivo').isIn(MOTIVOS_LICENCIAS_VALUES).withMessage('Motivo inválido'),
  body('detalleMotivo')
    .trim()
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('El detalle del motivo es obligatorio'),
];

export const decidirLicenciaValidator = [
  idParam,
  body('decision').isIn(['APROBAR', 'RECHAZAR']).withMessage('Decisión inválida'),
  body('motivoRechazo').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('observacionesDecision').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];

export const editarLicenciaValidator = [
  idParam,
  body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fechaFin').isISO8601().withMessage('Fecha de fin inválida'),
  body('motivo').isIn(MOTIVOS_LICENCIAS_VALUES).withMessage('Motivo inválido'),
  body('detalleMotivo')
    .trim()
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('El detalle del motivo es obligatorio'),
];

export const cancelarLicenciaValidator = [idParam];
