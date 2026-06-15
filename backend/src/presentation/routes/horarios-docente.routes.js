import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';

export function buildHorariosDocenteRouter({ controllers }) {
  const router = express.Router();

  router.get(
    '/:docenteId/grilla-conflictos',
    authenticate,
    verificarPermiso('institucional.horario.conflictos', 'LISTAR'),
    (req, res, next) => controllers.getDocenteGrillaConflictosController.handle(req, res, next),
  );

  return router;
}
