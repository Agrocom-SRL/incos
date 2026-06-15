import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  createGestionPlanValidator,
  updateGestionPlanEstadoValidator,
} from '../validators/oferta/oferta.validator.js';

export function buildGestionesPlanesRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;
  const permiso = 'institucional.oferta.gestion-plan';

  router.post(
    '/',
    authenticate,
    verificarPermiso(permiso, 'CREAR'),
    createGestionPlanValidator,
    validateRequest,
    (req, res, next) => controllers.createGestionPlanController.handle(req, res, next)
  );

  router.put(
    '/:id/estado',
    authenticate,
    verificarPermiso(permiso, 'EDITAR'),
    updateGestionPlanEstadoValidator,
    validateRequest,
    (req, res, next) => controllers.updateGestionPlanEstadoController.handle(req, res, next)
  );

  router.get(
    '/:id/paralelos-gestion',
    authenticate,
    verificarPermiso('institucional.oferta.paralelo-gestion', 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listParalelosGestionByGestionPlanController.handle(req, res, next)
  );

  router.post(
    '/:id/generar-paralelos-gestion',
    authenticate,
    verificarPermiso('institucional.oferta.paralelo-gestion', 'CREAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.generarParalelosGestionController.handle(req, res, next)
  );

  return router;
}
