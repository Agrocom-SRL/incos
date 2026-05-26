import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import {
  listTiposEvaluacionValidator,
  savePoliticaInstitucionalValidator,
  searchCoordinacionDocentesValidator,
  getCuadernoBimestreValidator,
  createEvaluacionCuadernoValidator,
  updateEvaluacionCuadernoValidator,
  deleteEvaluacionCuadernoValidator,
  upsertNotaCuadernoValidator,
  guardarNotasCuadernoBimestreValidator,
  getBimestreConsolidadoValidator,
  guardarBimestreConsolidadoValidator,
} from '../validators/academico/index.js';

/**
 * Router del módulo Calificaciones (Académico)
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @returns {import('express').Router}
 */
export function buildCalificacionesRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const coordinacionListar = [
    authenticate,
    verificarPermiso('academico.calificacion.coordinacion', 'LISTAR'),
  ];

  const politicaListar = [
    authenticate,
    verificarPermiso('academico.calificacion.politica', 'LISTAR'),
  ];

  const politicaEditar = [
    authenticate,
    verificarPermiso('academico.calificacion.politica', 'EDITAR'),
  ];

  /**
   * GET /api/v1/calificaciones/coordinacion/docentes
   * Docentes con cursos con estudiantes matriculados en gestión vigente.
   * Query: q, limit, preliminar=1
   */
  router.get(
    '/coordinacion/docentes',
    ...coordinacionListar,
    searchCoordinacionDocentesValidator,
    validateRequest,
    (req, res, next) => controllers.listCoordinacionCalificacionesDocentesController.handle(req, res, next)
  );

  const misCursosListar = [
    authenticate,
    verificarPermiso('academico.calificacion.mis_cursos', 'LISTAR'),
  ];

  /**
   * GET /api/v1/calificaciones/mis-cursos
   * Cursos del docente vinculado al usuario logueado (gestión vigente).
   */
  router.get(
    '/mis-cursos',
    ...misCursosListar,
    (req, res, next) => controllers.listCursosCalificacionesController.handle(req, res, next),
  );

  /**
   * GET /api/v1/calificaciones/coordinacion/docentes/:docenteId/cursos
   */
  router.get(
    '/coordinacion/docentes/:docenteId/cursos',
    ...coordinacionListar,
    (req, res, next) => controllers.listCursosCalificacionesController.handle(req, res, next),
  );

  /**
   * GET /api/v1/calificaciones/tipos-evaluacion
   * Catálogo tipos_evaluacion bimestrales (query: pagina, limite, busqueda).
   */
  router.get(
    '/tipos-evaluacion',
    ...politicaListar,
    listTiposEvaluacionValidator,
    validateRequest,
    (req, res, next) => controllers.listTiposEvaluacionController.handle(req, res, next)
  );

  /**
   * GET /api/v1/calificaciones/politica/catalogo
   * Carreras y periodos del plan para reglas de evaluaciones finales.
   */
  router.get(
    '/politica/catalogo',
    ...politicaListar,
    (req, res, next) => controllers.getPoliticaCatalogoController.handle(req, res, next)
  );

  /**
   * GET /api/v1/calificaciones/politica
   * Configuración institucional de notas (gestión vigente, configuracion_evaluacion).
   */
  router.get(
    '/politica',
    ...politicaListar,
    (req, res, next) => controllers.getPoliticaInstitucionalController.handle(req, res, next)
  );

  /**
   * PUT /api/v1/calificaciones/politica
   */
  router.put(
    '/politica',
    ...politicaEditar,
    savePoliticaInstitucionalValidator,
    validateRequest,
    (req, res, next) => controllers.savePoliticaInstitucionalController.handle(req, res, next)
  );

  const gestionBimestresListar = [
    authenticate,
    verificarPermiso('academico.calificacion.gestion_bimestres', 'LISTAR'),
  ];

  const gestionBimestresEditar = [
    authenticate,
    verificarPermiso('academico.calificacion.gestion_bimestres', 'EDITAR'),
  ];

  const cuadernoListar = [
    authenticate,
    verificarPermiso('academico.calificacion.cuaderno', 'LISTAR'),
  ];

  // Operaciones del cuaderno (bimestre vigente)
  const cuadernoEvaluacionesCrear = [
    authenticate,
    verificarPermiso('academico.calificacion.cuaderno.evaluaciones', 'CREAR'),
  ];
  const cuadernoEvaluacionesEditar = [
    authenticate,
    verificarPermiso('academico.calificacion.cuaderno.evaluaciones', 'EDITAR'),
  ];
  const cuadernoEvaluacionesEliminar = [
    authenticate,
    verificarPermiso('academico.calificacion.cuaderno.evaluaciones', 'ELIMINAR'),
  ];
  const cuadernoNotasEditar = [
    authenticate,
    verificarPermiso('academico.calificacion.cuaderno.notas', 'EDITAR'),
  ];
  const cuadernoGuardarEditar = [
    authenticate,
    verificarPermiso('academico.calificacion.cuaderno.guardar', 'EDITAR'),
  ];

  /** Habilitación administrativa en bimestre cerrado (POST consolidado). */
  const consolidadoAdminEditar = [
    authenticate,
    verificarPermisoCualquiera([
      ['academico.calificacion.gestion_bimestres', 'EDITAR'],
      ['academico.calificacion.bimestre.ajuste_admin', 'EDITAR'],
    ]),
  ];

  const registrarCierre = (controllerKey) => (req, res, next) =>
    controllers[controllerKey].handle(req, res, next);

  router.get(
    '/gestion-bimestres',
    ...gestionBimestresListar,
    (req, res, next) => controllers.getGestionBimestresController.handle(req, res, next),
  );

  router.post(
    '/gestion-bimestres/iniciar',
    ...gestionBimestresEditar,
    (req, res, next) => controllers.iniciarGestionAcademicaController.handle(req, res, next),
  );

  router.get(
    '/gestion-bimestres/bimestre/:numero/validar-cierre',
    ...gestionBimestresListar,
    (req, res, next) => controllers.validarCierreBimestreController.handle(req, res, next),
  );

  router.post(
    '/gestion-bimestres/bimestre/:numero/cerrar',
    ...gestionBimestresEditar,
    registrarCierre('cerrarBimestreGestionController'),
  );

  router.post(
    '/gestion-bimestres/:numero/cerrar',
    ...gestionBimestresEditar,
    registrarCierre('cerrarBimestreGestionController'),
  );

  router.get(
    '/gestion-bimestres/:numero/validar-cierre',
    ...gestionBimestresListar,
    (req, res, next) => controllers.validarCierreBimestreController.handle(req, res, next),
  );

  router.get(
    '/asignaciones/:asignacionId/notas',
    ...cuadernoListar,
    (req, res, next) => controllers.getRegistroNotasCursoController.handle(req, res, next),
  );

  router.get(
    '/asignaciones/:asignacionId/cuaderno/:bimestre',
    ...cuadernoListar,
    getCuadernoBimestreValidator,
    validateRequest,
    (req, res, next) => controllers.getCuadernoBimestreController.handle(req, res, next),
  );

  router.get(
    '/asignaciones/:asignacionId/bimestre/:bimestre/consolidado',
    ...cuadernoListar,
    getBimestreConsolidadoValidator,
    validateRequest,
    (req, res, next) => controllers.getBimestreConsolidadoController.handle(req, res, next),
  );

  router.post(
    '/asignaciones/:asignacionId/bimestre/:bimestre/consolidado',
    ...consolidadoAdminEditar,
    guardarBimestreConsolidadoValidator,
    validateRequest,
    (req, res, next) => controllers.guardarBimestreConsolidadoController.handle(req, res, next),
  );

  router.post(
    '/asignaciones/:asignacionId/cuaderno/:bimestre/evaluaciones',
    ...cuadernoEvaluacionesCrear,
    createEvaluacionCuadernoValidator,
    validateRequest,
    (req, res, next) => controllers.createEvaluacionCuadernoController.handle(req, res, next),
  );

  router.put(
    '/asignaciones/:asignacionId/cuaderno/:bimestre/evaluaciones/:evaluacionId',
    ...cuadernoEvaluacionesEditar,
    updateEvaluacionCuadernoValidator,
    validateRequest,
    (req, res, next) => controllers.updateEvaluacionCuadernoController.handle(req, res, next),
  );

  router.delete(
    '/asignaciones/:asignacionId/cuaderno/:bimestre/evaluaciones/:evaluacionId',
    ...cuadernoEvaluacionesEliminar,
    deleteEvaluacionCuadernoValidator,
    validateRequest,
    (req, res, next) => controllers.deleteEvaluacionCuadernoController.handle(req, res, next),
  );

  router.put(
    '/asignaciones/:asignacionId/cuaderno/:bimestre/notas',
    ...cuadernoNotasEditar,
    upsertNotaCuadernoValidator,
    validateRequest,
    (req, res, next) => controllers.upsertNotaCuadernoController.handle(req, res, next),
  );

  router.post(
    '/asignaciones/:asignacionId/cuaderno/:bimestre/guardar',
    ...cuadernoGuardarEditar,
    guardarNotasCuadernoBimestreValidator,
    validateRequest,
    (req, res, next) => controllers.guardarNotasCuadernoBimestreController.handle(req, res, next),
  );

  router.delete(
    '/asignaciones/:asignacionId/cuaderno/:bimestre/evaluaciones/:evaluacionId/notas',
    ...cuadernoEvaluacionesEliminar,
    deleteEvaluacionCuadernoValidator,
    validateRequest,
    (req, res, next) =>
      controllers.resetNotasEvaluacionCuadernoController.handle(req, res, next),
  );

  return router;
}
