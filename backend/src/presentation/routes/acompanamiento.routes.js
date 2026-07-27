import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
  estudianteIdParamValidator,
  listAlertasRiesgoValidator,
  alertaEstudianteValidator,
  listSesionesRefuerzoValidator,
  createSesionRefuerzoValidator,
  updateSesionRefuerzoValidator,
  registerAsistenciaSesionValidator,
  panelAcompanamientoValidator,
} from '../validators/tutorias/index.js';

/**
 * Construye el router de Acompañamiento Pedagógico (módulo TUT).
 *
 * Sub-recursos: alertas de riesgo (vista 156, calculada — sin tabla),
 * sesiones de refuerzo (ancladas en asignaciones_docentes) y panel.
 * Permisos: tutorias.acompanamiento.alerta / .sesion / .panel (acciones v2).
 *
 * Rutas estáticas SIEMPRE antes de /:id (alertas/mis-alumnos,
 * alertas/estudiante/:estudianteId, panel/exportar).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest)
 * @returns {Router} Router configurado de Express
 */
export function buildAcompanamientoRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const alertaListar = [authenticate, verificarPermiso('tutorias.acompanamiento.alerta', 'LISTAR')];
  const alertaDetalle = [authenticate, verificarPermiso('tutorias.acompanamiento.alerta', 'DETALLE')];
  const sesionListar = [authenticate, verificarPermiso('tutorias.acompanamiento.sesion', 'LISTAR')];
  const sesionDetalle = [authenticate, verificarPermiso('tutorias.acompanamiento.sesion', 'DETALLE')];
  const sesionCrear = [authenticate, verificarPermiso('tutorias.acompanamiento.sesion', 'CREAR')];
  const sesionEditar = [authenticate, verificarPermiso('tutorias.acompanamiento.sesion', 'EDITAR')];
  const sesionEliminar = [authenticate, verificarPermiso('tutorias.acompanamiento.sesion', 'ELIMINAR')];
  const panelListar = [authenticate, verificarPermiso('tutorias.acompanamiento.panel', 'LISTAR')];
  const panelExportar = [authenticate, verificarPermiso('tutorias.acompanamiento.panel', 'EXPORTAR')];

  // ============================================
  // ALERTAS DE RIESGO (vista 156)
  // ============================================

  // A1 GET /alertas - Listado de alertas de riesgo
  router.get(
    '/alertas',
    ...alertaListar,
    listAlertasRiesgoValidator,
    validateRequest,
    (req, res, next) => controllers.listAlertasRiesgoController.handle(req, res, next)
  );

  // A2 GET /alertas/mis-alumnos - Alertas de los cursos del docente de la sesión
  router.get('/alertas/mis-alumnos', ...alertaListar, (req, res, next) =>
    controllers.listMisAlertasRiesgoDocenteController.handle(req, res, next)
  );

  // A3 GET /alertas/estudiante/:estudianteId - Detalle de riesgo por estudiante
  router.get(
    '/alertas/estudiante/:estudianteId',
    ...alertaDetalle,
    estudianteIdParamValidator,
    alertaEstudianteValidator,
    validateRequest,
    (req, res, next) => controllers.getAlertaRiesgoEstudianteController.handle(req, res, next)
  );

  // ============================================
  // SESIONES DE REFUERZO
  // ============================================

  // A4 GET /sesiones - Listado de sesiones (vista 161)
  router.get(
    '/sesiones',
    ...sesionListar,
    listSesionesRefuerzoValidator,
    validateRequest,
    (req, res, next) => controllers.listSesionesRefuerzoController.handle(req, res, next)
  );

  // A6 POST /sesiones - Crear sesión + estudiantes iniciales
  router.post(
    '/sesiones',
    ...sesionCrear,
    createSesionRefuerzoValidator,
    validateRequest,
    (req, res, next) => controllers.createSesionRefuerzoController.handle(req, res, next)
  );

  // A5 GET /sesiones/:id - Ficha de la sesión (vista 161 + estudiantes)
  router.get('/sesiones/:id', ...sesionDetalle, idValidator, validateRequest, (req, res, next) =>
    controllers.getSesionRefuerzoByIdController.handle(req, res, next)
  );

  // A7 PUT /sesiones/:id - Actualizar sesión
  router.put(
    '/sesiones/:id',
    ...sesionEditar,
    idValidator,
    updateSesionRefuerzoValidator,
    validateRequest,
    (req, res, next) => controllers.updateSesionRefuerzoController.handle(req, res, next)
  );

  // A8 DELETE /sesiones/:id - Eliminar sesión (soft)
  router.delete('/sesiones/:id', ...sesionEliminar, idValidator, validateRequest, (req, res, next) =>
    controllers.deleteSesionRefuerzoController.handle(req, res, next)
  );

  // A9 PUT /sesiones/:id/participantes - Registro batch de asistencia/progreso
  router.put(
    '/sesiones/:id/participantes',
    ...sesionEditar,
    idValidator,
    registerAsistenciaSesionValidator,
    validateRequest,
    (req, res, next) => controllers.registerAsistenciaSesionController.handle(req, res, next)
  );

  // ============================================
  // PANEL DE ACOMPAÑAMIENTO (vistas 157/158/162)
  // ============================================

  // A11 GET /panel/exportar?gestionId= - PDF del panel (ANTES de /panel por claridad)
  router.get(
    '/panel/exportar',
    ...panelExportar,
    panelAcompanamientoValidator,
    validateRequest,
    (req, res, next) => controllers.exportPanelAcompanamientoController.handle(req, res, next)
  );

  // A10 GET /panel?gestionId= - Panel de acompañamiento
  router.get(
    '/panel',
    ...panelListar,
    panelAcompanamientoValidator,
    validateRequest,
    (req, res, next) => controllers.getPanelAcompanamientoController.handle(req, res, next)
  );

  return router;
}
