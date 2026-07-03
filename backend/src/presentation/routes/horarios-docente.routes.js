import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { buildDocenteSelfOnlyGuard } from '../middleware/docenteSelfOnly.middleware.js';

/**
 * Router de la grilla semanal del docente con conflictos.
 * Montado bajo /api/v1/horarios/docentes.
 *
 * El rol DOCENTE tiene `institucional.horario.conflictos` LISTAR para ver SU
 * propia grilla (portal del rol docente); el guard self (param `docenteId`)
 * impide consultar la grilla de otro docente (anti-IDOR). Staff sin vínculo
 * docente pasa sin restricción.
 */
export function buildHorariosDocenteRouter({ controllers }) {
  const router = express.Router();

  router.get(
    '/:docenteId/grilla-conflictos',
    authenticate,
    verificarPermiso('institucional.horario.conflictos', 'LISTAR'),
    buildDocenteSelfOnlyGuard('docenteId'),
    (req, res, next) => controllers.getDocenteGrillaConflictosController.handle(req, res, next),
  );

  return router;
}
