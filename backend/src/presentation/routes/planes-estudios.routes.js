import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
  createPlanEstudiosValidator,
  updatePlanEstudiosValidator,
  createPeriodoValidator,
} from '../validators/configuracion/planes-estudios.validator.js';
import { setEstadoCatalogoValidator } from '../validators/configuracion/set-estado.validator.js';

export function buildPlanesEstudiosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const permisoPlan = 'configuracion.plan-estudio';
  const permisoPeriodos = 'configuracion.plan-estudio.periodos';
  const permisoAsignaturas = 'configuracion.plan-estudio.asignaturas';
  const permisoPrerrequisitos = 'configuracion.plan-estudio.prerrequisitos';

  // -----------------------------
  // Planes de estudio
  // -----------------------------
  router.get(
    '/',
    authenticate,
    verificarPermiso(permisoPlan, 'LISTAR'),
    listValidator,
    validateRequest,
    (req, res, next) => controllers.listPlanesEstudiosController.handle(req, res, next)
  );

  router.get(
    '/:id',
    authenticate,
    verificarPermiso(permisoPlan, 'DETALLE'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.getPlanEstudiosByIdController.handle(req, res, next)
  );

  router.get(
    '/:id/matriz',
    authenticate,
    verificarPermiso(permisoPlan, 'DETALLE'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.getPlanEstudiosMatrizController.handle(req, res, next)
  );

  router.get(
    '/:id/validar',
    authenticate,
    verificarPermiso(permisoPlan, 'DETALLE'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.validarPlanEstudiosController.handle(req, res, next)
  );

  router.post(
    '/',
    authenticate,
    verificarPermiso(permisoPlan, 'CREAR'),
    createPlanEstudiosValidator,
    validateRequest,
    (req, res, next) => controllers.createPlanEstudiosController.handle(req, res, next)
  );

  router.put(
    '/:id',
    authenticate,
    verificarPermiso(permisoPlan, 'EDITAR'),
    idValidator,
    updatePlanEstudiosValidator,
    validateRequest,
    (req, res, next) => controllers.updatePlanEstudiosController.handle(req, res, next)
  );

  router.post(
    '/:id/marcar-vigente',
    authenticate,
    verificarPermiso(permisoPlan, 'ACTIVAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.marcarPlanEstudiosVigenteController.handle(req, res, next)
  );

  router.post(
    '/:id/clonar',
    authenticate,
    verificarPermiso(permisoPlan, 'CREAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.clonarPlanEstudiosController.handle(req, res, next)
  );

  // PATCH /:id/estado - Activar/desactivar plan de estudios (body: { activo: boolean })
  // Independiente de /marcar-vigente: no toca qué plan es el vigente de la carrera.
  router.patch(
    '/:id/estado',
    authenticate,
    verificarPermiso(permisoPlan, 'ACTIVAR'),
    idValidator,
    setEstadoCatalogoValidator,
    validateRequest,
    (req, res, next) => controllers.setEstadoPlanEstudiosController.handle(req, res, next)
  );

  // -----------------------------
  // Periodos
  // -----------------------------
  router.get(
    '/:id/periodos',
    authenticate,
    verificarPermisoCualquiera([
      [permisoPeriodos, 'LISTAR'],
      ['configuracion.paralelo', 'LISTAR'],
      ['configuracion.plan-estudio', 'DETALLE'],
    ]),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listPeriodosByPlanController.handle(req, res, next)
  );

  router.post(
    '/:id/periodos',
    authenticate,
    verificarPermiso(permisoPeriodos, 'CREAR'),
    idValidator,
    createPeriodoValidator,
    validateRequest,
    (req, res, next) => controllers.createPeriodoController.handle(req, res, next)
  );

  // -----------------------------
  // Asignaturas del plan
  // -----------------------------
  router.get(
    '/:id/asignaturas',
    authenticate,
    verificarPermiso(permisoAsignaturas, 'LISTAR'),
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listAsignaturasPlanByPlanController.handle(req, res, next)
  );

  return router;
}

