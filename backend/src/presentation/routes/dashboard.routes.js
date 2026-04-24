import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

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
    authenticate,
    (req, res, next) => controllers.getDashboardResumenController.handle(req, res, next)
  );

  return router;
}
