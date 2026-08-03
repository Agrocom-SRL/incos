import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { uploadAvanceProyecto } from '../middleware/upload.middleware.js';
import { proyectoGradoIntegranteGuard } from '../middleware/proyectoGradoSelfOnly.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  integranteIdValidator,
  entradaIdValidator,
  avanceIdValidator,
  dictamenIdValidator,
  actaIdValidator,
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
  listEstudiantesElegiblesValidator,
  avanceTutoriaCarreraValidator,
  planillaAvanceTercerAnioValidator,
  registrarActaDefensaValidator,
  anularActaDefensaValidator,
} from '../validators/titulacion/index.js';

/**
 * Construye el router de Proyectos de Grado (módulo TIT · titulación).
 *
 * Raíz: proyectos_grado (22-modalidades-grado.sql) + satélites tutoria_*
 * (schema 23). Permisos: titulacion.proyecto / .bitacora / .avance
 * con vocabulario de acciones v2.
 *
 * Rutas estáticas SIEMPRE antes de /:id (modalidades, mis-tutorados,
 * mi-proyecto, reportes/bitacora-mensual).
 *
 * Guard anti-IDOR (`proyectoGradoIntegranteGuard`, 2026-08-02): hallazgo
 * verificado en vivo (plan de desarrollo del acta de defensa, sección
 * "Estado de los Bloques F y G", G5) — ningún satélite de la ficha validaba
 * pertenencia por fila, solo el permiso grueso DETALLE/LISTAR; un
 * ESTUDIANTE podía leer el proyecto de OTRO estudiante por API directa. Se
 * agrega DESPUÉS de verificarPermiso+idValidator+validateRequest en los GET
 * de satélites que reciben `:id` del cliente (T6, T14, T22, acta-defensa).
 * NO se agrega en `/mi-proyecto`/`/mis-tutorados` (ya resuelven el ID en
 * servidor) ni en rutas de escritura (ya cerradas a ESTUDIANTE por
 * APROBAR/EDITAR/CREAR, que ESTUDIANTE no tiene — seed 65).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest)
 * @returns {Router} Router configurado de Express
 */
export function buildProyectosGradoRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const proyectoListar = [authenticate, verificarPermiso('titulacion.proyecto', 'LISTAR')];
  const proyectoDetalle = [authenticate, verificarPermiso('titulacion.proyecto', 'DETALLE')];
  const proyectoCrear = [authenticate, verificarPermiso('titulacion.proyecto', 'CREAR')];
  const proyectoEditar = [authenticate, verificarPermiso('titulacion.proyecto', 'EDITAR')];
  const proyectoEliminar = [authenticate, verificarPermiso('titulacion.proyecto', 'ELIMINAR')];
  const proyectoAprobar = [authenticate, verificarPermiso('titulacion.proyecto', 'APROBAR')];
  const proyectoExportar = [authenticate, verificarPermiso('titulacion.proyecto', 'EXPORTAR')];
  const bitacoraListar = [authenticate, verificarPermiso('titulacion.bitacora', 'LISTAR')];
  const bitacoraCrear = [authenticate, verificarPermiso('titulacion.bitacora', 'CREAR')];
  const bitacoraEditar = [authenticate, verificarPermiso('titulacion.bitacora', 'EDITAR')];
  const avanceListar = [authenticate, verificarPermiso('titulacion.avance', 'LISTAR')];
  const avanceDetalle = [authenticate, verificarPermiso('titulacion.avance', 'DETALLE')];
  const avanceCrear = [authenticate, verificarPermiso('titulacion.avance', 'CREAR')];

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

  // ============================================
  // Extensión 2026-07-31 — Requisito 1: estudiantes elegibles de 3er año
  // (formulario de elección de modalidad de graduación)
  // ============================================

  // GET /estudiantes-elegibles?search=&carreraId=&gestionId= - vista 178
  router.get(
    '/estudiantes-elegibles',
    ...proyectoListar,
    listEstudiantesElegiblesValidator,
    validateRequest,
    (req, res, next) =>
      controllers.listEstudiantesElegiblesModalidadGradoController.handle(req, res, next)
  );

  // ============================================
  // Extensión 2026-07-31 — Requisito 2: reporte de avance de tutorías por
  // carrera (vistas 179/160)
  // ============================================

  // GET /reportes/avance-carrera?gestionId=&carreraId=
  router.get(
    '/reportes/avance-carrera',
    ...proyectoListar,
    avanceTutoriaCarreraValidator,
    validateRequest,
    (req, res, next) => controllers.getAvanceTutoriaCarreraController.handle(req, res, next)
  );

  // GET /reportes/avance-carrera/pdf?gestionId=&carreraId=
  router.get(
    '/reportes/avance-carrera/pdf',
    ...proyectoExportar,
    avanceTutoriaCarreraValidator,
    validateRequest,
    (req, res, next) => controllers.exportAvanceTutoriaCarreraPdfController.handle(req, res, next)
  );

  // ============================================
  // Extensión 2026-07-31 — Requisito 3: planilla de avance de tutorías
  // "10 en 10" (bimestral, 3er año) (vista 181)
  // ============================================

  // GET /reportes/planilla-avance-tercer-anio?carreraId=&gestionId=&bimestre=
  router.get(
    '/reportes/planilla-avance-tercer-anio',
    ...proyectoListar,
    planillaAvanceTercerAnioValidator,
    validateRequest,
    (req, res, next) => controllers.getPlanillaAvanceTercerAnioController.handle(req, res, next)
  );

  // GET /reportes/planilla-avance-tercer-anio/export?carreraId=&gestionId=&bimestre=
  router.get(
    '/reportes/planilla-avance-tercer-anio/export',
    ...proyectoExportar,
    planillaAvanceTercerAnioValidator,
    validateRequest,
    (req, res, next) =>
      controllers.exportPlanillaAvanceTercerAnioExcelController.handle(req, res, next)
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

  // T6 GET /:id - Ficha del proyecto (guard anti-IDOR: ver nota de cabecera)
  router.get(
    '/:id',
    ...proyectoDetalle,
    idValidator,
    validateRequest,
    proyectoGradoIntegranteGuard,
    (req, res, next) => controllers.getProyectoGradoByIdController.handle(req, res, next)
  );

  // GET /:id/formulario-modalidad/pdf - PDF del FMDG-1 (Requisito 1, extensión 2026-07-31)
  router.get(
    '/:id/formulario-modalidad/pdf',
    ...proyectoExportar,
    idValidator,
    validateRequest,
    (req, res, next) =>
      controllers.exportFormularioModalidadGradoPdfController.handle(req, res, next)
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

  // T14 GET /:id/bitacora - Bitácora del proyecto (guard anti-IDOR: ver nota de cabecera)
  router.get(
    '/:id/bitacora',
    ...bitacoraListar,
    idValidator,
    validateRequest,
    proyectoGradoIntegranteGuard,
    (req, res, next) => controllers.listBitacoraProyectoController.handle(req, res, next)
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

  // T22 GET /:id/dictamenes - Dictámenes del proyecto (guard anti-IDOR: ver nota de cabecera)
  router.get(
    '/:id/dictamenes',
    ...proyectoDetalle,
    idValidator,
    validateRequest,
    proyectoGradoIntegranteGuard,
    (req, res, next) => controllers.listDictamenesProyectoController.handle(req, res, next)
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

  // ============================================
  // Extensión 2026-08-01 — Acta de defensa de grado
  // (anulación P8 agregada 2026-08-02)
  // ============================================

  // GET /:id/acta-defensa - Actas del proyecto (N si PSP), con tribunal anidado
  // (guard anti-IDOR: ver nota de cabecera)
  router.get(
    '/:id/acta-defensa',
    ...proyectoDetalle,
    idValidator,
    validateRequest,
    proyectoGradoIntegranteGuard,
    (req, res, next) => controllers.listActasDefensaController.handle(req, res, next)
  );

  // POST /:id/acta-defensa - Registra el/los acta(s) (delega T11 DEFENSA→APROBADO|REPROBADO)
  router.post(
    '/:id/acta-defensa',
    ...proyectoAprobar,
    idValidator,
    registrarActaDefensaValidator,
    validateRequest,
    (req, res, next) => controllers.registrarActaDefensaController.handle(req, res, next)
  );

  // GET /:id/acta-defensa/:actaId/pdf - PDF del acta (espejo §1 del plan)
  router.get(
    '/:id/acta-defensa/:actaId/pdf',
    ...proyectoExportar,
    idValidator,
    actaIdValidator,
    validateRequest,
    (req, res, next) => controllers.exportActaDefensaPdfController.handle(req, res, next)
  );

  // PATCH /:id/acta-defensa/:actaId/anular - Anula un acta EMITIDA (P8, decisión
  // manual; NO revierte la transición del proyecto)
  router.patch(
    '/:id/acta-defensa/:actaId/anular',
    ...proyectoAprobar,
    idValidator,
    actaIdValidator,
    anularActaDefensaValidator,
    validateRequest,
    (req, res, next) => controllers.anularActaDefensaController.handle(req, res, next)
  );

  return router;
}
