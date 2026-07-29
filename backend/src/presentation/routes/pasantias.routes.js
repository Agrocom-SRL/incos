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
 * Construye el router de Pasantías (módulo TUT · práctica laboral).
 *
 * Raíz: pasantias (24-pasantias.sql) + satélites pasantias_informes y
 * pasantias_seguimientos + catálogo pasantias_empresas. Permisos:
 * tutorias.pasantia / .empresa / .informe / .seguimiento con vocabulario de
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

  const pasantiaListar = [authenticate, verificarPermiso('tutorias.pasantia', 'LISTAR')];
  const pasantiaDetalle = [authenticate, verificarPermiso('tutorias.pasantia', 'DETALLE')];
  const pasantiaCrear = [authenticate, verificarPermiso('tutorias.pasantia', 'CREAR')];
  const pasantiaEditar = [authenticate, verificarPermiso('tutorias.pasantia', 'EDITAR')];
  const pasantiaEliminar = [authenticate, verificarPermiso('tutorias.pasantia', 'ELIMINAR')];
  const pasantiaAprobar = [authenticate, verificarPermiso('tutorias.pasantia', 'APROBAR')];
  const pasantiaExportar = [authenticate, verificarPermiso('tutorias.pasantia', 'EXPORTAR')];
  const empresaListar = [authenticate, verificarPermiso('tutorias.pasantia.empresa', 'LISTAR')];
  const empresaCrear = [authenticate, verificarPermiso('tutorias.pasantia.empresa', 'CREAR')];
  const empresaEditar = [authenticate, verificarPermiso('tutorias.pasantia.empresa', 'EDITAR')];
  const empresaActivar = [authenticate, verificarPermiso('tutorias.pasantia.empresa', 'ACTIVAR')];
  const informeListar = [authenticate, verificarPermiso('tutorias.pasantia.informe', 'LISTAR')];
  const informeCrear = [authenticate, verificarPermiso('tutorias.pasantia.informe', 'CREAR')];
  const informeEditar = [authenticate, verificarPermiso('tutorias.pasantia.informe', 'EDITAR')];
  const seguimientoListar = [
    authenticate,
    verificarPermiso('tutorias.pasantia.seguimiento', 'LISTAR'),
  ];
  const seguimientoCrear = [
    authenticate,
    verificarPermiso('tutorias.pasantia.seguimiento', 'CREAR'),
  ];
  const seguimientoEditar = [
    authenticate,
    verificarPermiso('tutorias.pasantia.seguimiento', 'EDITAR'),
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

  return router;
}
