import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  empresaIdValidator,
  informeIdValidator,
  seguimientoIdValidator,
  listPasantiasValidator,
  listPasantiasEmpresasValidator,
  createPasantiaValidator,
  updatePasantiaValidator,
  transicionPasantiaValidator,
  createPasantiaEmpresaValidator,
  updatePasantiaEmpresaValidator,
  setEstadoPasantiaEmpresaValidator,
  createInformePasantiaValidator,
  updateInformePasantiaValidator,
  createSeguimientoPasantiaValidator,
  updateSeguimientoPasantiaValidator,
} from '../validators/pasantias/index.js';

/**
 * Construye el router de Pasantías (módulo TIT · práctica laboral).
 *
 * Raíz: pasantias (24-pasantias.sql) + satélites pasantias_informes y
 * pasantias_seguimientos + catálogo pasantias_empresas. Permisos:
 * titulacion.pasantia / .empresa / .informe / .seguimiento con vocabulario de
 * acciones v2 (APROBAR = transiciones de estado; EXPORTAR = PDF de informes).
 *
 * Rutas estáticas SIEMPRE antes de /:id (empresas, mis-pasantias,
 * mi-pasantia).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest)
 * @returns {Router} Router configurado de Express
 */
export function buildPasantiasRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const pasantiaListar = [authenticate, verificarPermiso('titulacion.pasantia', 'LISTAR')];
  const pasantiaDetalle = [authenticate, verificarPermiso('titulacion.pasantia', 'DETALLE')];
  const pasantiaCrear = [authenticate, verificarPermiso('titulacion.pasantia', 'CREAR')];
  const pasantiaEditar = [authenticate, verificarPermiso('titulacion.pasantia', 'EDITAR')];
  const pasantiaEliminar = [authenticate, verificarPermiso('titulacion.pasantia', 'ELIMINAR')];
  const pasantiaAprobar = [authenticate, verificarPermiso('titulacion.pasantia', 'APROBAR')];
  const pasantiaExportar = [authenticate, verificarPermiso('titulacion.pasantia', 'EXPORTAR')];
  const empresaListar = [authenticate, verificarPermiso('titulacion.pasantia.empresa', 'LISTAR')];
  const empresaDetalle = [authenticate, verificarPermiso('titulacion.pasantia.empresa', 'DETALLE')];
  const empresaCrear = [authenticate, verificarPermiso('titulacion.pasantia.empresa', 'CREAR')];
  const empresaEditar = [authenticate, verificarPermiso('titulacion.pasantia.empresa', 'EDITAR')];
  const empresaActivar = [authenticate, verificarPermiso('titulacion.pasantia.empresa', 'ACTIVAR')];
  const empresaEliminar = [
    authenticate,
    verificarPermiso('titulacion.pasantia.empresa', 'ELIMINAR'),
  ];
  const informeListar = [authenticate, verificarPermiso('titulacion.pasantia.informe', 'LISTAR')];
  const informeCrear = [authenticate, verificarPermiso('titulacion.pasantia.informe', 'CREAR')];
  const informeEditar = [authenticate, verificarPermiso('titulacion.pasantia.informe', 'EDITAR')];
  const seguimientoListar = [
    authenticate,
    verificarPermiso('titulacion.pasantia.seguimiento', 'LISTAR'),
  ];
  const seguimientoCrear = [
    authenticate,
    verificarPermiso('titulacion.pasantia.seguimiento', 'CREAR'),
  ];
  const seguimientoEditar = [
    authenticate,
    verificarPermiso('titulacion.pasantia.seguimiento', 'EDITAR'),
  ];

  // ============================================
  // RUTAS ESTÁTICAS (antes de /:id)
  // ============================================

  // P1 GET / - Listado de trámites (vista 167)
  router.get('/', ...pasantiaListar, listPasantiasValidator, validateRequest, (req, res, next) =>
    controllers.listPasantiasController.handle(req, res, next)
  );

  // P7 GET /empresas - Catálogo de empresas (incluirInactivos)
  router.get(
    '/empresas',
    ...empresaListar,
    listPasantiasEmpresasValidator,
    validateRequest,
    (req, res, next) => controllers.listPasantiasEmpresasController.handle(req, res, next)
  );

  // P8 POST /empresas - Alta de empresa
  router.post(
    '/empresas',
    ...empresaCrear,
    createPasantiaEmpresaValidator,
    validateRequest,
    (req, res, next) => controllers.createPasantiaEmpresaController.handle(req, res, next)
  );

  // P20 GET /empresas/:empresaId - Ficha de empresa
  router.get(
    '/empresas/:empresaId',
    ...empresaDetalle,
    empresaIdValidator,
    validateRequest,
    (req, res, next) => controllers.getPasantiaEmpresaController.handle(req, res, next)
  );

  // P9 PUT /empresas/:empresaId - Edición de empresa
  router.put(
    '/empresas/:empresaId',
    ...empresaEditar,
    empresaIdValidator,
    updatePasantiaEmpresaValidator,
    validateRequest,
    (req, res, next) => controllers.updatePasantiaEmpresaController.handle(req, res, next)
  );

  // P10 PATCH /empresas/:empresaId/estado - Activar/desactivar (body: { activo })
  router.patch(
    '/empresas/:empresaId/estado',
    ...empresaActivar,
    empresaIdValidator,
    setEstadoPasantiaEmpresaValidator,
    validateRequest,
    (req, res, next) => controllers.setEstadoPasantiaEmpresaController.handle(req, res, next)
  );

  // P21 DELETE /empresas/:empresaId - Eliminar empresa (soft)
  router.delete(
    '/empresas/:empresaId',
    ...empresaEliminar,
    empresaIdValidator,
    validateRequest,
    (req, res, next) => controllers.deletePasantiaEmpresaController.handle(req, res, next)
  );

  // P18 GET /mis-pasantias - Bandeja del docente supervisor de la sesión (anti-IDOR)
  router.get('/mis-pasantias', ...pasantiaListar, (req, res, next) =>
    controllers.listMisPasantiasSupervisadasController.handle(req, res, next)
  );

  // P19 GET /mi-pasantia - Trámite del estudiante de la sesión (anti-IDOR)
  router.get('/mi-pasantia', ...pasantiaDetalle, (req, res, next) =>
    controllers.getMiPasantiaController.handle(req, res, next)
  );

  // P3 POST / - Registrar trámite (PASANTIA | CONVALIDACION)
  router.post('/', ...pasantiaCrear, createPasantiaValidator, validateRequest, (req, res, next) =>
    controllers.createPasantiaController.handle(req, res, next)
  );

  // ============================================
  // RUTAS CON /:id
  // ============================================

  // P2 GET /:id - Ficha del trámite (vista 168)
  router.get('/:id', ...pasantiaDetalle, idValidator, validateRequest, (req, res, next) =>
    controllers.getPasantiaByIdController.handle(req, res, next)
  );

  // P4 PUT /:id - Actualizar trámite
  router.put(
    '/:id',
    ...pasantiaEditar,
    idValidator,
    updatePasantiaValidator,
    validateRequest,
    (req, res, next) => controllers.updatePasantiaController.handle(req, res, next)
  );

  // P5 DELETE /:id - Eliminar trámite (soft)
  router.delete('/:id', ...pasantiaEliminar, idValidator, validateRequest, (req, res, next) =>
    controllers.deletePasantiaController.handle(req, res, next)
  );

  // P6 POST /:id/transiciones - Transición de estado (máquina por camino)
  router.post(
    '/:id/transiciones',
    ...pasantiaAprobar,
    idValidator,
    transicionPasantiaValidator,
    validateRequest,
    (req, res, next) => controllers.transicionarPasantiaController.handle(req, res, next)
  );

  // P11 GET /:id/informes - Informes del trámite
  router.get('/:id/informes', ...informeListar, idValidator, validateRequest, (req, res, next) =>
    controllers.listInformesPasantiaController.handle(req, res, next)
  );

  // P12 POST /:id/informes - Emitir informe (genera PDF institucional)
  router.post(
    '/:id/informes',
    ...informeCrear,
    idValidator,
    createInformePasantiaValidator,
    validateRequest,
    (req, res, next) => controllers.createInformePasantiaController.handle(req, res, next)
  );

  // P14 GET /:id/informes/:informeId/pdf - Descarga del PDF (res.download)
  router.get(
    '/:id/informes/:informeId/pdf',
    ...pasantiaExportar,
    idValidator,
    informeIdValidator,
    validateRequest,
    (req, res, next) => controllers.exportInformePasantiaPdfController.handle(req, res, next)
  );

  // P13 PUT /:id/informes/:informeId - Editar informe (regenera PDF)
  router.put(
    '/:id/informes/:informeId',
    ...informeEditar,
    idValidator,
    informeIdValidator,
    updateInformePasantiaValidator,
    validateRequest,
    (req, res, next) => controllers.updateInformePasantiaController.handle(req, res, next)
  );

  // P15 GET /:id/seguimientos - Seguimientos del trámite
  router.get(
    '/:id/seguimientos',
    ...seguimientoListar,
    idValidator,
    validateRequest,
    (req, res, next) => controllers.listSeguimientosPasantiaController.handle(req, res, next)
  );

  // P16 POST /:id/seguimientos - Registrar seguimiento
  router.post(
    '/:id/seguimientos',
    ...seguimientoCrear,
    idValidator,
    createSeguimientoPasantiaValidator,
    validateRequest,
    (req, res, next) => controllers.createSeguimientoPasantiaController.handle(req, res, next)
  );

  // P17 PUT /:id/seguimientos/:seguimientoId - Editar seguimiento
  router.put(
    '/:id/seguimientos/:seguimientoId',
    ...seguimientoEditar,
    idValidator,
    seguimientoIdValidator,
    updateSeguimientoPasantiaValidator,
    validateRequest,
    (req, res, next) => controllers.updateSeguimientoPasantiaController.handle(req, res, next)
  );

  // GET /:id/seguimientos/:seguimientoId/pdf - Descarga de la hoja de seguimiento (extensión 2026-08-11)
  router.get(
    '/:id/seguimientos/:seguimientoId/pdf',
    ...pasantiaExportar,
    idValidator,
    seguimientoIdValidator,
    validateRequest,
    (req, res, next) => controllers.exportSeguimientoPasantiaPdfController.handle(req, res, next)
  );

  return router;
}
