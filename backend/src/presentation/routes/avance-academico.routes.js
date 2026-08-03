import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';

/**
 * Router del Avance académico (Académico · ítem ACA `/academico/avance`).
 * Nace con la disolución del módulo REP (2026-07-29): reemplaza al retirado
 * `reportes.avance_academico`; el permiso dueño es `academico.avance`
 * (rehabilitado en el seed 59).
 *
 * Alcance self: si el usuario tiene vínculo de ESTUDIANTE, el use case acota
 * en servidor a su propia fila ("Mi avance") — sin permisos adicionales.
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @returns {import('express').Router}
 */
export function buildAvanceAcademicoRouter({ controllers }) {
  const router = express.Router();

  const listar = [authenticate, verificarPermiso('academico.avance', 'LISTAR')];
  const exportar = [authenticate, verificarPermiso('academico.avance', 'EXPORTAR')];

  /**
   * GET /api/v1/avance-academico[?carreraId=<id>]
   * Listado estudiante × plan con % de avance (dataKey: `avance`).
   */
  router.get('/', ...listar, (req, res, next) =>
    controllers.getAvanceAcademicoController.handle(req, res, next),
  );

  /**
   * GET /api/v1/avance-academico/export[?carreraId=<id>]
   * Descarga Excel (1 hoja, planilla verde).
   */
  router.get('/export', ...exportar, (req, res, next) =>
    controllers.exportAvanceAcademicoController.handle(req, res, next),
  );

  return router;
}

export default buildAvanceAcademicoRouter;
