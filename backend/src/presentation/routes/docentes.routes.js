import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import { createTeacherValidator, updateTeacherValidator } from '../validators/docentes/index.js';

/**
 * Router del módulo Docentes.
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @param {Function} params.middlewares.validateRequest
 */
export function buildDocentesRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const docentesListar = [authenticate, verificarPermiso('docentes.ver', 'LISTAR')];
  const docenteDetalle = [authenticate, verificarPermiso('docentes.ver', 'DETALLE')];
  const docenteCrear = [authenticate, verificarPermiso('docentes.crear', 'CREAR')];
  const docenteEditar = [authenticate, verificarPermiso('docentes.editar', 'EDITAR')];

  router.get(
    '/',
    ...docentesListar,
    listValidator,
    validateRequest,
    (req, res, next) => controllers.listTeachersController.handle(req, res, next)
  );

  router.post(
    '/',
    ...docenteCrear,
    createTeacherValidator,
    validateRequest,
    (req, res, next) => controllers.createTeacherController.handle(req, res, next)
  );

  router.put(
    '/:id',
    ...docenteEditar,
    ...idValidator,
    updateTeacherValidator,
    validateRequest,
    (req, res, next) => controllers.updateTeacherController.handle(req, res, next)
  );

  router.get(
    '/:id',
    ...docenteDetalle,
    ...idValidator,
    validateRequest,
    (req, res, next) => controllers.getTeacherByIdController.handle(req, res, next)
  );

  return router;
}
