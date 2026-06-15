import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  createAsignaturaPlanValidator,
  updateAsignaturaPlanValidator,
} from '../validators/configuracion/planes-estudios.validator.js';

export function buildAsignaturasPlanRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const permisoAsignaturas = 'configuracion.plan-estudio.asignaturas';
  const permisoPrerrequisitos = 'configuracion.plan-estudio.prerrequisitos';

  router.post(
    '/',
    authenticate,
    verificarPermiso(permisoAsignaturas, 'CREAR'),
    createAsignaturaPlanValidator,
    validateRequest,
    (req, res, next) => controllers.createAsignaturaPlanController.handle(req, res, next)
  );

  router.put(
    '/:id',
    authenticate,
    verificarPermiso(permisoAsignaturas, 'EDITAR'),
    idValidator,
    updateAsignaturaPlanValidator,
    validateRequest,
    (req, res, next) => controllers.updateAsignaturaPlanController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    authenticate,
    verificarPermiso(permisoAsignaturas, 'ELIMINAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.deleteAsignaturaPlanController.handle(req, res, next)
  );

  router.get(
    '/:id/prerrequisitos',
    authenticate,
    verificarPermiso(permisoPrerrequisitos, 'DETALLE'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listPrerrequisitosByAsignaturaController.handle(req, res, next)
  );

  router.get(
    '/:id/es-prerrequisito-de',
    authenticate,
    verificarPermiso(permisoPrerrequisitos, 'DETALLE'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listEsPrerrequisitoDeController.handle(req, res, next)
  );

  return router;
}

