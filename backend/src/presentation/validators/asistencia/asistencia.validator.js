import { body, param, query } from 'express-validator';
import { ESTADOS_ASISTENCIA_VALUES } from '../../../domain/constants/asistencia.constants.js';

const asignacionParam = param('asignacionId')
  .isInt({ min: 1 })
  .withMessage('Asignación inválida');

const bimestreQuery = query('bimestre')
  .isInt({ min: 1, max: 4 })
  .withMessage('Bimestre debe ser entre 1 y 4');

export const getCalendarioAsistenciaValidator = [asignacionParam, bimestreQuery];

export const getPlanillaAsistenciaValidator = [
  asignacionParam,
  query('desde').isISO8601().withMessage('Fecha "desde" inválida'),
  query('hasta').isISO8601().withMessage('Fecha "hasta" inválida'),
];

export const bulkRegistrarAsistenciaValidator = [
  asignacionParam,
  body('dias').isArray({ min: 1 }).withMessage('dias debe ser un arreglo no vacío'),
  body('dias.*.fechaClase').isISO8601().withMessage('fechaClase inválida'),
  body('dias.*.esEspecial').optional().isBoolean(),
  body('dias.*.motivo').optional({ nullable: true }).isString().isLength({ max: 255 }),
  body('dias.*.marcas').optional().isArray().withMessage('marcas debe ser un arreglo'),
  body('dias.*.marcas.*.matriculaMateriaId').optional().isInt({ min: 1 }),
  body('dias.*.marcas.*.estado')
    .optional()
    .isIn(ESTADOS_ASISTENCIA_VALUES)
    .withMessage('Estado de asistencia inválido'),
];

export const cerrarRegistroAsistenciaValidator = [asignacionParam, bimestreQuery];

export const reabrirRegistroAsistenciaValidator = [asignacionParam, bimestreQuery];

export const crearSesionEspecialValidator = [
  asignacionParam,
  body('fecha').isISO8601().withMessage('fecha inválida'),
  body('motivo')
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage('Motivo requerido'),
  body('horaInicio').optional({ nullable: true }).isString(),
  body('horaFin').optional({ nullable: true }).isString(),
];
