import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  createOfertaCursoValidator,
  updateOfertaCursoEstadoValidator,
} from '../validators/oferta/oferta-academica.validator.js';

export function buildOfertaCursosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const permiso = 'institucional.oferta.cursos';

  router.post(
    '/',
    authenticate,
    verificarPermiso(permiso, 'CREAR'),
    createOfertaCursoValidator,
    validateRequest,
    (req, res, next) => controllers.createOfertaCursoController.handle(req, res, next)
  );

  router.put(
    '/:id/estado',
    authenticate,
    verificarPermiso(permiso, 'EDITAR'),
    updateOfertaCursoEstadoValidator,
    validateRequest,
    (req, res, next) => controllers.updateOfertaCursoEstadoController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    authenticate,
    verificarPermiso(permiso, 'ELIMINAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.deleteOfertaCursoController.handle(req, res, next)
  );

  return router;
}
