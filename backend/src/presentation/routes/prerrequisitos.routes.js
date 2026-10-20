import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import { createPrerrequisitoValidator } from '../validators/configuracion/planes-estudios.validator.js';

export function buildPrerrequisitosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const permisoPrerrequisitos = 'configuracion.plan-estudio.prerrequisitos';

  router.post(
    '/',
    authenticate,
    verificarPermiso(permisoPrerrequisitos, 'CREAR'),
    createPrerrequisitoValidator,
    validateRequest,
    (req, res, next) => controllers.createPrerrequisitoController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    authenticate,
    verificarPermiso(permisoPrerrequisitos, 'ELIMINAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.deletePrerrequisitoController.handle(req, res, next)
  );

  return router;
}
