import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  listTiposEvaluacionValidator,
  savePoliticaInstitucionalValidator,
  searchCoordinacionDocentesValidator,
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
   * Catálogo tipos_evaluacion (query: ambito=BIMESTRE|MATERIA_COMPLETA, pagina, limite, busqueda).
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

  return router;
}
