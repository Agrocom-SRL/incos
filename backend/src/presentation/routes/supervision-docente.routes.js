import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  listFichasSeguimientoValidator,
  createFichaSeguimientoValidator,
  updateFichaSeguimientoValidator,
} from '../validators/docentes/index.js';

/**
 * Construye el router de Supervisión docente (módulo DOC).
 *
 * Raíz: fichas_seguimiento_clase (27-supervision-docente.sql). Permiso ÚNICO
 * del ítem de menú: docentes.supervision.ficha con vocabulario de acciones v2
 * (LISTAR/DETALLE/CREAR/EDITAR/EXPORTAR — sin ELIMINAR ni APROBAR: la ficha
 * realizada no se borra).
 *
 * Rutas estáticas SIEMPRE antes de /:id. /mis-fichas lleva gate solo
 * [authenticate] (patrón misDatosDocente): el docente de la sesión se resuelve
 * en servidor con resolveDocenteIdForUsuario (403 si no es docente, anti-IDOR).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del recurso
 * @param {Object} params.middlewares - Middlewares (validateRequest)
 * @returns {Router} Router configurado de Express
 */
export function buildSupervisionDocenteRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const fichaListar = [authenticate, verificarPermiso('docentes.supervision.ficha', 'LISTAR')];
  const fichaDetalle = [authenticate, verificarPermiso('docentes.supervision.ficha', 'DETALLE')];
  const fichaCrear = [authenticate, verificarPermiso('docentes.supervision.ficha', 'CREAR')];
  const fichaEditar = [authenticate, verificarPermiso('docentes.supervision.ficha', 'EDITAR')];
  const fichaExportar = [authenticate, verificarPermiso('docentes.supervision.ficha', 'EXPORTAR')];

  // Portal del docente: autoservicio sin permiso propio (como /docentes/mis-datos).
  const misFichasDocente = [authenticate];

  // ============================================
  // RUTAS ESTÁTICAS (antes de /:id)
  // ============================================

  // S1 GET / - Listado de fichas (vista 174)
  router.get(
    '/',
    ...fichaListar,
    listFichasSeguimientoValidator,
    validateRequest,
    (req, res, next) => controllers.listFichasSeguimientoController.handle(req, res, next)
  );

  // S5 GET /mis-fichas - Fichas del docente de la sesión (anti-IDOR)
  // IMPORTANTE: debe ir ANTES de /:id para evitar conflictos.
  router.get('/mis-fichas', ...misFichasDocente, (req, res, next) =>
    controllers.listMisFichasSeguimientoController.handle(req, res, next)
  );

  // S3 POST / - Registrar ficha (supervisor = usuario de la sesión)
  router.post(
    '/',
    ...fichaCrear,
    createFichaSeguimientoValidator,
    validateRequest,
    (req, res, next) => controllers.createFichaSeguimientoController.handle(req, res, next)
  );

  // ============================================
  // RUTAS CON /:id
  // ============================================

  // S6 GET /:id/pdf - PDF de la ficha (réplica del formulario físico)
  router.get('/:id/pdf', ...fichaExportar, idValidator, validateRequest, (req, res, next) =>
    controllers.exportFichaSeguimientoPdfController.handle(req, res, next)
  );

  // S2 GET /:id - Ficha completa (entidad + contexto de la vista 174)
  router.get('/:id', ...fichaDetalle, idValidator, validateRequest, (req, res, next) =>
    controllers.getFichaSeguimientoByIdController.handle(req, res, next)
  );

  // S4 PUT /:id - Actualizar ficha (el evaluador no se reasigna)
  router.put(
    '/:id',
    ...fichaEditar,
    idValidator,
    updateFichaSeguimientoValidator,
    validateRequest,
    (req, res, next) => controllers.updateFichaSeguimientoController.handle(req, res, next)
  );

  return router;
}
