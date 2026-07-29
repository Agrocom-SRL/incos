import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { uploadAvanceProyecto } from '../middleware/upload.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  integranteIdValidator,
  entradaIdValidator,
  avanceIdValidator,
  dictamenIdValidator,
  listProyectosGradoValidator,
  exportBitacoraMensualValidator,
  createProyectoGradoValidator,
  updateProyectoGradoValidator,
  asignarTutorValidator,
  transicionProyectoValidator,
  addIntegranteValidator,
  updateIntegranteValidator,
  createBitacoraEntradaValidator,
  updateBitacoraEntradaValidator,
  createAvanceValidator,
} from '../validators/tutorias/index.js';

/**
 * Construye el router de Proyectos de Grado (módulo TUT · titulación).
 *
 * Raíz: proyectos_grado (22-modalidades-grado.sql) + satélites tutoria_*
 * (schema 23). Permisos: tutorias.titulacion.proyecto / .bitacora / .avance
 * con vocabulario de acciones v2.
 *
 * Rutas estáticas SIEMPRE antes de /:id (modalidades, mis-tutorados,
 * mi-proyecto, reportes/bitacora-mensual).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest)
 * @returns {Router} Router configurado de Express
 */
export function buildProyectosGradoRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const proyectoListar = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'LISTAR')];
  const proyectoDetalle = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'DETALLE')];
  const proyectoCrear = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'CREAR')];
  const proyectoEditar = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'EDITAR')];
  const proyectoEliminar = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'ELIMINAR')];
  const proyectoAprobar = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'APROBAR')];
  const proyectoExportar = [authenticate, verificarPermiso('tutorias.titulacion.proyecto', 'EXPORTAR')];
  const bitacoraListar = [authenticate, verificarPermiso('tutorias.titulacion.bitacora', 'LISTAR')];
  const bitacoraCrear = [authenticate, verificarPermiso('tutorias.titulacion.bitacora', 'CREAR')];
  const bitacoraEditar = [authenticate, verificarPermiso('tutorias.titulacion.bitacora', 'EDITAR')];
  const avanceListar = [authenticate, verificarPermiso('tutorias.titulacion.avance', 'LISTAR')];
  const avanceDetalle = [authenticate, verificarPermiso('tutorias.titulacion.avance', 'DETALLE')];
  const avanceCrear = [authenticate, verificarPermiso('tutorias.titulacion.avance', 'CREAR')];

  // ============================================
  // RUTAS ESTÁTICAS (antes de /:id)
  // ============================================

  // T1 GET / - Listado de proyectos (vista 160)
  router.get(
    '/',
    ...proyectoListar,
    listProyectosGradoValidator,
    validateRequest,
    (req, res, next) => controllers.listProyectosGradoController.handle(req, res, next)
  );

  // T2 GET /modalidades - Catálogo de modalidades de grado
  router.get('/modalidades', ...proyectoListar, (req, res, next) =>
    controllers.listModalidadesGradoController.handle(req, res, next)
  );

  // T3 GET /mis-tutorados - Bandeja del tutor de la sesión (anti-IDOR)
  router.get('/mis-tutorados', ...proyectoListar, (req, res, next) =>
    controllers.listMisTutoradosController.handle(req, res, next)
  );

  // T4 GET /mi-proyecto - Proyecto vigente del estudiante de la sesión (anti-IDOR)
  router.get('/mi-proyecto', ...proyectoDetalle, (req, res, next) =>
    controllers.getMiProyectoGradoController.handle(req, res, next)
  );

  // T5 GET /reportes/bitacora-mensual?mes=&gestionId= - PDF (vista 163)
  router.get(
    '/reportes/bitacora-mensual',
    ...proyectoExportar,
    exportBitacoraMensualValidator,
    validateRequest,
    (req, res, next) => controllers.exportBitacoraMensualTutorController.handle(req, res, next)
  );

  // T7 POST / - Crear proyecto (+ TITULAR e integrantes si PSP)
  router.post(
    '/',
    ...proyectoCrear,
    createProyectoGradoValidator,
    validateRequest,
    (req, res, next) => controllers.createProyectoGradoController.handle(req, res, next)
  );

  // ============================================
  // RUTAS CON /:id
  // ============================================

  // T6 GET /:id - Ficha del proyecto
  router.get('/:id', ...proyectoDetalle, idValidator, validateRequest, (req, res, next) =>
    controllers.getProyectoGradoByIdController.handle(req, res, next)
  );

  // T8 PUT /:id - Actualizar proyecto
  router.put(
    '/:id',
    ...proyectoEditar,
    idValidator,
    updateProyectoGradoValidator,
    validateRequest,
    (req, res, next) => controllers.updateProyectoGradoController.handle(req, res, next)
  );

  // T9 DELETE /:id - Eliminar proyecto (soft)
  router.delete('/:id', ...proyectoEliminar, idValidator, validateRequest, (req, res, next) =>
    controllers.deleteProyectoGradoController.handle(req, res, next)
  );

  // T10 POST /:id/tutor - Asignar tutor (genera PDF DESIGNACION_OFICIAL)
  router.post(
    '/:id/tutor',
    ...proyectoAprobar,
    idValidator,
    asignarTutorValidator,
    validateRequest,
    (req, res, next) => controllers.asignarTutorProyectoController.handle(req, res, next)
  );

  // T11 POST /:id/transiciones - Transición de estado (VIABILIDAD_TECNICA al aprobar)
  router.post(
    '/:id/transiciones',
    ...proyectoAprobar,
    idValidator,
    transicionProyectoValidator,
    validateRequest,
    (req, res, next) => controllers.aprobarEtapaProyectoController.handle(req, res, next)
  );

  // T12 POST /:id/integrantes - Agregar integrante
  router.post(
    '/:id/integrantes',
    ...proyectoEditar,
    idValidator,
    addIntegranteValidator,
    validateRequest,
    (req, res, next) => controllers.addIntegranteProyectoController.handle(req, res, next)
  );

  // T13 PATCH /:id/integrantes/:integranteId - Actualizar integrante
  router.patch(
    '/:id/integrantes/:integranteId',
    ...proyectoEditar,
    idValidator,
    integranteIdValidator,
    updateIntegranteValidator,
    validateRequest,
    (req, res, next) => controllers.updateIntegranteProyectoController.handle(req, res, next)
  );

  // T14 GET /:id/bitacora - Bitácora del proyecto
  router.get('/:id/bitacora', ...bitacoraListar, idValidator, validateRequest, (req, res, next) =>
    controllers.listBitacoraProyectoController.handle(req, res, next)
  );

  // T15 POST /:id/bitacora - Crear entrada (REVISION_AVANCE actualiza el avance)
  router.post(
    '/:id/bitacora',
    ...bitacoraCrear,
    idValidator,
    createBitacoraEntradaValidator,
    validateRequest,
    (req, res, next) => controllers.createBitacoraEntradaController.handle(req, res, next)
  );

  // T17 POST /:id/bitacora/:entradaId/confirmar - Confirmación del estudiante
  // (acción LISTAR + guard de pertenencia en servidor, decisión del orquestador)
  router.post(
    '/:id/bitacora/:entradaId/confirmar',
    ...bitacoraListar,
    idValidator,
    entradaIdValidator,
    validateRequest,
    (req, res, next) => controllers.confirmarBitacoraEstudianteController.handle(req, res, next)
  );

  // T16 PUT /:id/bitacora/:entradaId - Actualizar entrada
  router.put(
    '/:id/bitacora/:entradaId',
    ...bitacoraEditar,
    idValidator,
    entradaIdValidator,
    updateBitacoraEntradaValidator,
    validateRequest,
    (req, res, next) => controllers.updateBitacoraEntradaController.handle(req, res, next)
  );

  // T18 GET /:id/avances - Avances del proyecto
  router.get('/:id/avances', ...avanceListar, idValidator, validateRequest, (req, res, next) =>
    controllers.listAvancesProyectoController.handle(req, res, next)
  );

  // T20 POST /:id/avances - Subir avance (multipart, campo `archivo`)
  router.post(
    '/:id/avances',
    ...avanceCrear,
    idValidator,
    validateRequest,
    uploadAvanceProyecto,
    createAvanceValidator,
    validateRequest,
    (req, res, next) => controllers.createAvanceProyectoController.handle(req, res, next)
  );

  // T21 GET /:id/avances/:avanceId/archivo - Descarga autenticada (res.download)
  router.get(
    '/:id/avances/:avanceId/archivo',
    ...avanceDetalle,
    idValidator,
    avanceIdValidator,
    validateRequest,
    (req, res, next) => controllers.downloadAvanceArchivoController.handle(req, res, next)
  );

  // T19 GET /:id/avances/:avanceId - Detalle del avance
  router.get(
    '/:id/avances/:avanceId',
    ...avanceDetalle,
    idValidator,
    avanceIdValidator,
    validateRequest,
    (req, res, next) => controllers.getAvanceByIdController.handle(req, res, next)
  );

  // T22 GET /:id/dictamenes - Dictámenes del proyecto
  router.get('/:id/dictamenes', ...proyectoDetalle, idValidator, validateRequest, (req, res, next) =>
    controllers.listDictamenesProyectoController.handle(req, res, next)
  );

  // T23 GET /:id/dictamenes/:dictamenId/archivo - Descarga del PDF (res.download)
  router.get(
    '/:id/dictamenes/:dictamenId/archivo',
    ...proyectoExportar,
    idValidator,
    dictamenIdValidator,
    validateRequest,
    (req, res, next) => controllers.exportDictamenPdfController.handle(req, res, next)
  );

  return router;
}
