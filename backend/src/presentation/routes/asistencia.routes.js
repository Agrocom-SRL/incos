import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  getCalendarioAsistenciaValidator,
  getPlanillaAsistenciaValidator,
  bulkRegistrarAsistenciaValidator,
  cerrarRegistroAsistenciaValidator,
  reabrirRegistroAsistenciaValidator,
  crearSesionEspecialValidator,
  eliminarSesionEspecialValidator,
} from '../validators/asistencia/index.js';

/**
 * Router del módulo Asistencia (Académico · ítem ACA-ASI). Gemelo de Calificaciones.
 * Fase 2 (lectura):
 *   - mis cursos del docente (registro.ver)
 *   - coordinación: elegir docente + sus cursos (registro.coordinacion)
 * Toma de asistencia (modelo sesiones_clase):
 *   - calendario / planilla (registro.cuaderno · LISTAR)
 *   - registrar planilla, cerrar/reabrir, sesión especial (registro.cuaderno · EDITAR)
 * Consolidado % (página Consolidado — REP disuelto 2026-07-29):
 *   - matriz % por paralelo (consolidado.ver · LISTAR) + export Excel (· EXPORTAR)
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @returns {import('express').Router}
 */
export function buildAsistenciaRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const registroListar = [
    authenticate,
    verificarPermiso('academico.asistencia.registro.ver', 'LISTAR'),
  ];
  const coordinacionListar = [
    authenticate,
    verificarPermiso('academico.asistencia.registro.coordinacion', 'LISTAR'),
  ];
  const cuadernoListar = [
    authenticate,
    verificarPermiso('academico.asistencia.registro.cuaderno', 'LISTAR'),
  ];
  const cuadernoEditar = [
    authenticate,
    verificarPermiso('academico.asistencia.registro.cuaderno', 'EDITAR'),
  ];
  const consolidadoListar = [
    authenticate,
    verificarPermiso('academico.asistencia.consolidado.ver', 'LISTAR'),
  ];
  const consolidadoExportar = [
    authenticate,
    verificarPermiso('academico.asistencia.consolidado.ver', 'EXPORTAR'),
  ];

  /**
   * GET /api/v1/asistencia/coordinacion/docentes
   * Docentes con cursos con estudiantes matriculados (gestión vigente). Reusa el
   * caso de uso de coordinación de Calificaciones (mismos datos, distinto permiso).
   */
  router.get('/coordinacion/docentes', ...coordinacionListar, (req, res, next) =>
    controllers.coordinacionDocentesController.handle(req, res, next),
  );

  /**
   * GET /api/v1/asistencia/coordinacion/docentes/:docenteId/cursos
   * Cursos de un docente específico (vista coordinación del admin).
   */
  router.get('/coordinacion/docentes/:docenteId/cursos', ...coordinacionListar, (req, res, next) =>
    controllers.getMisCursosAsistenciaController.handle(req, res, next),
  );

  /**
   * GET /api/v1/asistencia/mis-cursos
   * Cursos del docente vinculado al usuario logueado (gestión vigente).
   */
  router.get('/mis-cursos', ...registroListar, (req, res, next) =>
    controllers.getMisCursosAsistenciaController.handle(req, res, next),
  );

  // ============================================
  // Consolidado % (matriz estudiantes × asignaturas del paralelo)
  // ============================================

  /**
   * GET /api/v1/asistencia/consolidado?paraleloGestionId=<id>[&bimestre=1..4]
   * Matriz % de asistencia del paralelo (sin bimestre = acumulado anual).
   */
  router.get('/consolidado', ...consolidadoListar, (req, res, next) =>
    controllers.getConsolidadoAsistenciaController.handle(req, res, next),
  );

  /**
   * GET /api/v1/asistencia/consolidado/export?paraleloGestionId=<id>[&bimestre=1..4]
   * Descarga Excel del consolidado (1 hoja, planilla verde).
   */
  router.get('/consolidado/export', ...consolidadoExportar, (req, res, next) =>
    controllers.exportConsolidadoAsistenciaController.handle(req, res, next),
  );

  // ============================================
  // Toma de asistencia (modelo sesiones_clase)
  // ============================================

  /** GET calendario del bimestre (días tomados, neutros, futuros). */
  router.get(
    '/cursos/:asignacionId/calendario',
    ...cuadernoListar,
    getCalendarioAsistenciaValidator,
    validateRequest,
    (req, res, next) => controllers.getCalendarioAsistenciaController.handle(req, res, next),
  );

  /** GET planilla (roster × días del rango). */
  router.get(
    '/cursos/:asignacionId/planilla',
    ...cuadernoListar,
    getPlanillaAsistenciaValidator,
    validateRequest,
    (req, res, next) => controllers.getPlanillaAsistenciaController.handle(req, res, next),
  );

  /** PUT planilla (upsert de sesiones + marcas sparse, transaccional). */
  router.put(
    '/cursos/:asignacionId/planilla',
    ...cuadernoEditar,
    bulkRegistrarAsistenciaValidator,
    validateRequest,
    (req, res, next) => controllers.bulkRegistrarAsistenciaController.handle(req, res, next),
  );

  /** POST cerrar registro del bimestre (lote). */
  router.post(
    '/cursos/:asignacionId/registro/cerrar',
    ...cuadernoEditar,
    cerrarRegistroAsistenciaValidator,
    validateRequest,
    (req, res, next) => controllers.cerrarRegistroAsistenciaController.handle(req, res, next),
  );

  /** POST reabrir registro del bimestre (lote). */
  router.post(
    '/cursos/:asignacionId/registro/reabrir',
    ...cuadernoEditar,
    reabrirRegistroAsistenciaValidator,
    validateRequest,
    (req, res, next) => controllers.reabrirRegistroAsistenciaController.handle(req, res, next),
  );

  /** POST crear/editar sesión especial (taller/recuperación; permite fecha futura). */
  router.post(
    '/cursos/:asignacionId/sesiones-especiales',
    ...cuadernoEditar,
    crearSesionEspecialValidator,
    validateRequest,
    (req, res, next) => controllers.crearSesionEspecialController.handle(req, res, next),
  );

  /** DELETE eliminar sesión especial (solo si no tiene asistencia tomada). */
  router.delete(
    '/cursos/:asignacionId/sesiones-especiales/:fecha',
    ...cuadernoEditar,
    eliminarSesionEspecialValidator,
    validateRequest,
    (req, res, next) => controllers.eliminarSesionEspecialController.handle(req, res, next),
  );

  return router;
}
