import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import {
  createAsignacionDocenteValidator,
  updateAsignacionDocenteValidator,
} from '../validators/asignaciones-docentes/asignaciones-docentes.validator.js';
import { query } from 'express-validator';

export const listAsignacionesDocentesQueryValidator = [
  query('gestion_plan_id').optional().isInt({ min: 1 }),
  query('paralelo_gestion_id').optional().isInt({ min: 1 }),
  query('docente_id').optional().isInt({ min: 1 }),
  query('oferta_curso_id').optional().isInt({ min: 1 }),
  query('vigente').optional().isIn(['true', 'false', '1', '0']),
];

/**
 * Router /api/v1/asignaciones-docentes
 */
export function buildAsignacionesDocentesRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const listar = [authenticate, verificarPermiso('docentes.asignar', 'EDITAR')];
  const detalle = [authenticate, verificarPermiso('docentes.asignar', 'EDITAR')];
  const crear = [authenticate, verificarPermiso('docentes.asignar', 'EDITAR')];
  const editar = [authenticate, verificarPermiso('docentes.asignar', 'EDITAR')];
  const eliminar = [authenticate, verificarPermiso('docentes.asignar', 'ELIMINAR')];

  router.get(
    '/',
    ...listar,
    listValidator,
    ...listAsignacionesDocentesQueryValidator,
    validateRequest,
    (req, res, next) => controllers.listAsignacionesDocentesController.handle(req, res, next)
  );

  router.post(
    '/',
    ...crear,
    createAsignacionDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.createAsignacionDocenteController.handle(req, res, next)
  );

  router.get(
    '/:id',
    ...detalle,
    ...idValidator,
    validateRequest,
    (req, res, next) => controllers.getAsignacionDocenteByIdController.handle(req, res, next)
  );

  router.put(
    '/:id',
    ...editar,
    ...idValidator,
    updateAsignacionDocenteValidator,
    validateRequest,
    (req, res, next) => controllers.updateAsignacionDocenteController.handle(req, res, next)
  );

  router.delete(
    '/:id',
    ...eliminar,
    ...idValidator,
    validateRequest,
    (req, res, next) => controllers.deleteAsignacionDocenteController.handle(req, res, next)
  );

  return router;
}
