import express from 'express';
import { listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Rutas del resumen del dashboard (panel principal).
 *
 * @param {Object} params
 * @param {Object} params.controllers
 */
export function buildDashboardRouter({ controllers }) {
  const router = express.Router();

  // Panel admin (catálogo de referencia). Permiso de dominio.
  router.get(
    '/resumen',
    ...listarCatalogoReferencia,
    (req, res, next) => controllers.getDashboardResumenController.handle(req, res, next)
  );

  // Panel del estudiante (autoservicio como /auth/me). Gate solo `authenticate`:
  // el vínculo usuario↔estudiante se resuelve en servidor y blinda el acceso (403).
  router.get(
    '/mi-resumen',
    authenticate,
    (req, res, next) => controllers.getMiDashboardResumenController.handle(req, res, next)
  );

  // Panel del docente (portal del rol docente). Gate solo `authenticate`:
  // el vínculo usuario↔docente se resuelve en servidor (resolveDocenteIdForUsuario)
  // y blinda el acceso (403 si el usuario no tiene vínculo docente).
  router.get(
    '/mi-resumen-docente',
    authenticate,
    (req, res, next) => controllers.getMiDashboardResumenDocenteController.handle(req, res, next)
  );

  return router;
}
