import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  listHistorialMatriculaParaleloValidator,
  registrarEventoHistorialMatriculaValidator,
  registrarDecisionAdministrativaValidator,
  programarNivelacionValidator,
  registrarResultadoNivelacionValidator,
} from '../validators/academico/index.js';

/**
 * Router de Nivelaciones (ACA, schema 16 — Fase D). Montado bajo
 * /api/v1/nivelaciones. RBAC `academico.nivelacion.*` (ver/inscribir/aprobar
 * — seed 59, RECTOR/DIR_ACADEMICO únicamente: ABANDONO/RETIRADO y
 * nivelación son decisión administrativa, nunca del docente).
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @returns {import('express').Router}
 */
export function buildNivelacionesRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const nivelacionVer = [authenticate, verificarPermiso('academico.nivelacion.ver', 'LISTAR')];
  const nivelacionInscribir = [
    authenticate,
    verificarPermiso('academico.nivelacion.inscribir', 'CREAR'),
  ];
  const nivelacionAprobar = [
    authenticate,
    verificarPermiso('academico.nivelacion.aprobar', 'APROBAR'),
  ];

  /** GET /pendientes-por-paralelo — conteo para el selector P1 nivel 1 (antes de /?...). */
  router.get('/pendientes-por-paralelo', ...nivelacionVer, (req, res, next) =>
    controllers.listPendientesNivelacionParaleloController.handle(req, res, next),
  );

  /** GET /pendientes — bandeja plana PROGRAMADA/EN_CURSO cruzando paralelos (B3). */
  router.get('/pendientes', ...nivelacionAprobar, (req, res, next) =>
    controllers.listNivelacionesPendientesController.handle(req, res, next),
  );

  /** GET /?paraleloGestionId=<entero> — grilla de nivelaciones del paralelo. */
  router.get(
    '/',
    ...nivelacionVer,
    listHistorialMatriculaParaleloValidator,
    validateRequest,
    (req, res, next) => controllers.listHistorialMatriculaParaleloController.handle(req, res, next),
  );

  /** POST /eventos — evento genérico de historial_matricula (sin nota). */
  router.post(
    '/eventos',
    ...nivelacionInscribir,
    registrarEventoHistorialMatriculaValidator,
    validateRequest,
    (req, res, next) =>
      controllers.registrarEventoHistorialMatriculaController.handle(req, res, next),
  );

  /** POST /decisiones-administrativas — ABANDONO/RETIRADO (nota_forzada). */
  router.post(
    '/decisiones-administrativas',
    ...nivelacionAprobar,
    registrarDecisionAdministrativaValidator,
    validateRequest,
    (req, res, next) =>
      controllers.registrarDecisionAdministrativaController.handle(req, res, next),
  );

  /** POST /examenes — programa un examen de nivelación (PROGRAMADA). */
  router.post(
    '/examenes',
    ...nivelacionInscribir,
    programarNivelacionValidator,
    validateRequest,
    (req, res, next) => controllers.programarNivelacionController.handle(req, res, next),
  );

  /** PATCH /examenes/:levelingId/resultado — cierra el examen con nota/estado. */
  router.patch(
    '/examenes/:levelingId/resultado',
    ...nivelacionAprobar,
    registrarResultadoNivelacionValidator,
    validateRequest,
    (req, res, next) =>
      controllers.registrarResultadoNivelacionController.handle(req, res, next),
  );

  return router;
}

export default buildNivelacionesRouter;
