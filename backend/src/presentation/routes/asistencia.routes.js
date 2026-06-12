import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';

/**
 * Router del módulo Asistencia (Académico · ítem ACA-ASI). Gemelo de Calificaciones.
 * Fase 2 (lectura):
 *   - mis cursos del docente (registro.ver)
 *   - coordinación: elegir docente + sus cursos (registro.coordinacion)
 * Planilla diaria y consolidado se añaden en sub-pasos siguientes.
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @returns {import('express').Router}
 */
export function buildAsistenciaRouter({ controllers }) {
  const router = express.Router();

  const registroListar = [
    authenticate,
    verificarPermiso('academico.asistencia.registro.ver', 'LISTAR'),
  ];
  const coordinacionListar = [
    authenticate,
    verificarPermiso('academico.asistencia.registro.coordinacion', 'LISTAR'),
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

  return router;
}
