import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';

/**
 * Router de Deserción estudiantil (Académico · pestaña Deserción de
 * `/academico/avance`). Nace con la disolución del módulo REP (2026-07-29):
 * reemplaza al retirado `reportes.desercion`; el permiso dueño es
 * `academico.desercion` (nuevo en el seed 59, roles RECTOR/DIR_ACADEMICO).
 *
 * Métrica ANUAL por estados consolidados ABANDONO/RETIRADO de
 * matriculas_materia (vistas 172/173) — distinta del riesgo pedagógico por
 * notas del módulo TUT (156/157).
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @returns {import('express').Router}
 */
export function buildDesercionRouter({ controllers }) {
  const router = express.Router();

  const listar = [authenticate, verificarPermiso('academico.desercion', 'LISTAR')];
  const exportar = [authenticate, verificarPermiso('academico.desercion', 'EXPORTAR')];

  /**
   * GET /api/v1/desercion[?gestionId=<id>][&carreraId=<id>]
   * Agregado carrera × gestión + detalle de desertores
   * (dataKeys: `carreras`, `desertores`, `resumen`).
   */
  router.get('/', ...listar, (req, res, next) =>
    controllers.getDesercionController.handle(req, res, next),
  );

  /**
   * GET /api/v1/desercion/export[?gestionId=<id>][&carreraId=<id>]
   * Descarga Excel (1 hoja, planilla verde).
   */
  router.get('/export', ...exportar, (req, res, next) =>
    controllers.exportDesercionController.handle(req, res, next),
  );

  return router;
}

export default buildDesercionRouter;
