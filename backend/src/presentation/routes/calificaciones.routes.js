import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { searchCoordinacionDocentesValidator } from '../validators/academico/index.js';

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

  return router;
}
