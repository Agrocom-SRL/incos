import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  listarLicenciasValidator,
  getLicenciaByIdValidator,
  getInscripcionVigenteValidator,
  crearLicenciaValidator,
  decidirLicenciaValidator,
  editarLicenciaValidator,
  cancelarLicenciaValidator,
} from '../validators/licencias/index.js';

/**
 * Router de Licencias estudiantiles (Académico · ítem ACA-ASI, página dentro de Asistencia).
 * Montado bajo /api/v1/asistencia/licencias. RBAC academico.asistencia.licencia.*.
 * @see docs/plan/MODULO-ASISTENCIA.md §6.3 y §9.
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @returns {import('express').Router}
 */
export function buildLicenciasRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const licenciaListar = [
    authenticate,
    verificarPermiso('academico.asistencia.licencia.ver', 'LISTAR'),
  ];
  const licenciaDetalle = [
    authenticate,
    verificarPermiso('academico.asistencia.licencia.ver', 'DETALLE'),
  ];
  const licenciaCrear = [
    authenticate,
    verificarPermiso('academico.asistencia.licencia.crear', 'CREAR'),
  ];
  const licenciaAprobar = [
    authenticate,
    verificarPermiso('academico.asistencia.licencia.aprobar', 'APROBAR'),
  ];
  const licenciaEditar = [
    authenticate,
    verificarPermiso('academico.asistencia.licencia.crear', 'EDITAR'),
  ];
  const licenciaCancelar = [
    authenticate,
    verificarPermiso('academico.asistencia.licencia.crear', 'ELIMINAR'),
  ];

  /** GET / — listado de licencias (filtro opcional por estado). */
  router.get('/', ...licenciaListar, listarLicenciasValidator, validateRequest, (req, res, next) =>
    controllers.listarLicenciasController.handle(req, res, next),
  );

  /** GET /inscripcion-vigente — apoyo al formulario de solicitud (antes de /:id). */
  router.get(
    '/inscripcion-vigente',
    ...licenciaCrear,
    getInscripcionVigenteValidator,
    validateRequest,
    (req, res, next) => controllers.getInscripcionVigenteController.handle(req, res, next),
  );

  /** GET /:id — detalle de una licencia. */
  router.get(
    '/:id',
    ...licenciaDetalle,
    getLicenciaByIdValidator,
    validateRequest,
    (req, res, next) => controllers.getLicenciaByIdController.handle(req, res, next),
  );

  /** POST / — solicitar una licencia (estado inicial PENDIENTE). */
  router.post('/', ...licenciaCrear, crearLicenciaValidator, validateRequest, (req, res, next) =>
    controllers.crearLicenciaController.handle(req, res, next),
  );

  /** PUT /:id/decision — aprobar o rechazar una licencia PENDIENTE. */
  router.put(
    '/:id/decision',
    ...licenciaAprobar,
    decidirLicenciaValidator,
    validateRequest,
    (req, res, next) => controllers.decidirLicenciaController.handle(req, res, next),
  );

  /** PUT /:id/cancel — cancelar una licencia PENDIENTE o APROBADA (→ CANCELADA). */
  router.put(
    '/:id/cancel',
    ...licenciaCancelar,
    cancelarLicenciaValidator,
    validateRequest,
    (req, res, next) => controllers.cancelarLicenciaController.handle(req, res, next),
  );

  /** PUT /:id — editar una licencia PENDIENTE (motivo, detalle, rango de fechas). */
  router.put('/:id', ...licenciaEditar, editarLicenciaValidator, validateRequest, (req, res, next) =>
    controllers.editarLicenciaController.handle(req, res, next),
  );

  return router;
}

export default buildLicenciasRouter;
