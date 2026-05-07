import express from 'express';
import { listarCatalogoReferencia } from '../middleware/permisos.middleware.js';

/**
 * Rutas del resumen del dashboard (panel principal).
 *
 * @param {Object} params
 * @param {Object} params.controllers
 */
export function buildDashboardRouter({ controllers }) {
  const router = express.Router();

  router.get(
    '/resumen',
    ...listarCatalogoReferencia,
    (req, res, next) => controllers.getDashboardResumenController.handle(req, res, next)
  );

  return router;
}
