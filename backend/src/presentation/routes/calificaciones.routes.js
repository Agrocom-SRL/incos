import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
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

  /**
   * GET /api/v1/calificaciones/politica
   * Configuración institucional de notas (gestión vigente).
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
