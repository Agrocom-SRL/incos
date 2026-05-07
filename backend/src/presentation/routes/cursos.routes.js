import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { patchCursoOfertaValidator } from '../validators/academico/index.js';
import { idValidator } from '../validators/common/index.js';

/**
 * Router de cursos (maestro de oferta).
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 */
export function buildCursosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const editar = [authenticate, verificarPermiso('institucional.gestion.horarios', 'EDITAR')];
  const eliminar = [authenticate, verificarPermiso('institucional.gestion.horarios', 'ELIMINAR')];

  router.patch(
    '/:id',
    ...editar,
    idValidator,
    patchCursoOfertaValidator,
    validateRequest,
    (req, res, next) => controllers.patchCursoOfertaController.handle(req, res, next),
  );

  router.delete(
    '/:id',
    ...eliminar,
    idValidator,
    validateRequest,
    (req, res, next) => controllers.deleteCursoOfertaController.handle(req, res, next),
  );

  return router;
}
