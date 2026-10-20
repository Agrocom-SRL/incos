import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import { updatePeriodoValidator } from '../validators/configuracion/planes-estudios.validator.js';

export function buildPeriodosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const permisoPeriodos = 'configuracion.plan-estudio.periodos';
  const permisoAsignaturas = 'configuracion.plan-estudio.asignaturas';

  router.put(
    '/:id',
    authenticate,
    verificarPermiso(permisoPeriodos, 'EDITAR'),
    idValidator,
    updatePeriodoValidator,
    validateRequest,
    (req, res, next) => controllers.updatePeriodoController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    authenticate,
    verificarPermiso(permisoPeriodos, 'ELIMINAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.deletePeriodoController.handle(req, res, next)
  );

  router.get(
    '/:id/asignaturas',
    authenticate,
    verificarPermiso(permisoAsignaturas, 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listAsignaturasPlanByPeriodoController.handle(req, res, next)
  );

  return router;
}
