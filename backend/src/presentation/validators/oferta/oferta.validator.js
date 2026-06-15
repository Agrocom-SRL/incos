import { body, param } from 'express-validator';
import { ESTADOS_GESTION_PLAN_VALUES } from '../../../domain/constants/cursos.constants.js';
import { TURNOS_VALUES } from '../../../domain/constants/cursos.constants.js';
import {
  ESTADOS_PARALELO_GESTION_VALUES,
  ESTADOS_OFERTA_CURSO_VALUES,
} from '../../../domain/constants/oferta.constants.js';

export const createGestionPlanValidator = [
  body('gestion_id').optional().isInt({ min: 1 }),
  body('gestionId').optional().isInt({ min: 1 }),
  body('plan_estudio_id').optional().isInt({ min: 1 }),
  body('planEstudioId').optional().isInt({ min: 1 }),
  body().custom((_, { req }) => {
    const g = req.body.gestion_id ?? req.body.gestionId;
    const p = req.body.plan_estudio_id ?? req.body.planEstudioId;
    if (!g || !p) throw new Error('gestion_id y plan_estudio_id son requeridos');
    return true;
  }),
];

export const updateGestionPlanEstadoValidator = [
  param('id').isInt({ min: 1 }),
  body('estado').isIn(ESTADOS_GESTION_PLAN_VALUES),
];

export const updateParaleloGestionValidator = [
  param('id').isInt({ min: 1 }),
  body('aula_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('aulaId').optional({ nullable: true }).isInt({ min: 1 }),
  body('cupo_maximo').optional().isInt({ min: 1 }),
  body('cupoMaximo').optional().isInt({ min: 1 }),
  body('cupo_minimo').optional().isInt({ min: 1 }),
  body('cupoMinimo').optional().isInt({ min: 1 }),
  body('observaciones').optional().isString(),
];

export const cambiarTurnoParaleloGestionValidator = [
  param('id').isInt({ min: 1 }),
  body('turno').isIn(TURNOS_VALUES),
];

export const updateParaleloGestionEstadoValidator = [
  param('id').isInt({ min: 1 }),
  body('estado').isIn(ESTADOS_PARALELO_GESTION_VALUES),
];

export const createOfertaCursoValidator = [
  body('paralelo_gestion_id').optional().isInt({ min: 1 }),
  body('paraleloGestionId').optional().isInt({ min: 1 }),
  body('asignatura_plan_id').optional().isInt({ min: 1 }),
  body('asignaturaPlanId').optional().isInt({ min: 1 }),
  body().custom((_, { req }) => {
    const pg = req.body.paralelo_gestion_id ?? req.body.paraleloGestionId;
    const ap = req.body.asignatura_plan_id ?? req.body.asignaturaPlanId;
    if (!pg || !ap) throw new Error('paralelo_gestion_id y asignatura_plan_id son requeridos');
    return true;
  }),
];

export const updateOfertaCursoEstadoValidator = [
  param('id').isInt({ min: 1 }),
  body('estado').isIn(ESTADOS_OFERTA_CURSO_VALUES),
];
