import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  asignacionHorarioIdValidator,
  createAsignacionHorarioValidator,
  updateAsignacionHorarioValidator,
  bulkAsignacionHorariosValidator,
} from '../validators/horarios/asignacion-horarios.validator.js';

export function buildAsignacionHorariosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const permiso = 'institucional.horario.armado';

  const editar = [authenticate, verificarPermiso(permiso, 'EDITAR')];

  router.post(
    '/bulk',
    ...editar,
    bulkAsignacionHorariosValidator,
    validateRequest,
    (req, res, next) => controllers.bulkAsignacionHorariosController.handle(req, res, next)
  );

  router.post(
    '/',
    ...editar,
    createAsignacionHorarioValidator,
    validateRequest,
    (req, res, next) => controllers.createAsignacionHorarioController.handle(req, res, next)
  );

  router.put(
    '/:id',
    ...editar,
    updateAsignacionHorarioValidator,
    validateRequest,
    (req, res, next) => controllers.updateAsignacionHorarioController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    ...editar,
    asignacionHorarioIdValidator,
    validateRequest,
    (req, res, next) => controllers.deleteAsignacionHorarioController.handle(req, res, next)
  );

  return router;
}
