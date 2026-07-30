import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  listLibrosValidator,
  abrirLibroValidator,
  getLibroByIdValidator,
  editarLibroValidator,
  listParalelosLibroValidator,
  generarFoliosParaleloValidator,
  getFolioByIdValidator,
  cambiarEstadoFolioValidator,
  editarFolioEstudianteValidator,
  exportLibroExcelValidator,
} from '../validators/academico/index.js';

/**
 * Router de Libros de registro del centralizador (ACA · schema 25).
 * Montado bajo /api/v1/libros. RBAC academico.libro (LISTAR/DETALLE/CREAR/
 * EDITAR/APROBAR/EXPORTAR — sin ELIMINAR: un folio se ANULA, no se borra).
 *
 * @param {Object} params
 * @param {Object} params.controllers
 * @param {Object} params.middlewares
 * @returns {import('express').Router}
 */
export function buildLibrosRouter({ controllers, middlewares }) {
  const router = express.Router();
  const { validateRequest } = middlewares;

  const libroListar = [authenticate, verificarPermiso('academico.libro', 'LISTAR')];
  const libroDetalle = [authenticate, verificarPermiso('academico.libro', 'DETALLE')];
  const libroCrear = [authenticate, verificarPermiso('academico.libro', 'CREAR')];
  const libroEditar = [authenticate, verificarPermiso('academico.libro', 'EDITAR')];
  const libroAprobar = [authenticate, verificarPermiso('academico.libro', 'APROBAR')];
  const libroExportar = [authenticate, verificarPermiso('academico.libro', 'EXPORTAR')];

  /** GET / — listado de libros (filtros opcionales carreraId/gestionId). */
  router.get('/', ...libroListar, listLibrosValidator, validateRequest, (req, res, next) =>
    controllers.listLibrosController.handle(req, res, next),
  );

  /** POST / — abrir un libro para una carrera y gestión. */
  router.post('/', ...libroCrear, abrirLibroValidator, validateRequest, (req, res, next) =>
    controllers.abrirLibroController.handle(req, res, next),
  );

  /** GET /:id/export — descarga Excel del libro completo (antes de GET /:id). */
  router.get(
    '/:id/export',
    ...libroExportar,
    exportLibroExcelValidator,
    validateRequest,
    (req, res, next) => controllers.exportLibroExcelController.handle(req, res, next),
  );

  /** GET /:id/paralelos — paralelos candidatos del generador de folios. */
  router.get(
    '/:id/paralelos',
    ...libroCrear,
    listParalelosLibroValidator,
    validateRequest,
    (req, res, next) => controllers.listParalelosLibroController.handle(req, res, next),
  );

  /** POST /:id/folios — generar folios de un paralelo (body: paraleloGestionId). */
  router.post(
    '/:id/folios',
    ...libroCrear,
    generarFoliosParaleloValidator,
    validateRequest,
    (req, res, next) => controllers.generarFoliosParaleloController.handle(req, res, next),
  );

  /** PATCH /:id/folios/:folioId/estado — BORRADOR→IMPRESO→FIRMADO / ANULADO. */
  router.patch(
    '/:id/folios/:folioId/estado',
    ...libroAprobar,
    cambiarEstadoFolioValidator,
    validateRequest,
    (req, res, next) => controllers.cambiarEstadoFolioController.handle(req, res, next),
  );

  /** PATCH /:id/folios/:folioId/estudiantes/:filaId — fila (si NO FIRMADO). */
  router.patch(
    '/:id/folios/:folioId/estudiantes/:filaId',
    ...libroEditar,
    editarFolioEstudianteValidator,
    validateRequest,
    (req, res, next) => controllers.editarFolioEstudianteController.handle(req, res, next),
  );

  /** GET /:id/folios/:folioId — detalle del folio (nómina + celdas 135). */
  router.get(
    '/:id/folios/:folioId',
    ...libroDetalle,
    getFolioByIdValidator,
    validateRequest,
    (req, res, next) => controllers.getFolioByIdController.handle(req, res, next),
  );

  /** GET /:id — ficha del libro (cabecera + folios). */
  router.get('/:id', ...libroDetalle, getLibroByIdValidator, validateRequest, (req, res, next) =>
    controllers.getLibroByIdController.handle(req, res, next),
  );

  /** PATCH /:id — editar cabecera / cerrar el libro. */
  router.patch('/:id', ...libroEditar, editarLibroValidator, validateRequest, (req, res, next) =>
    controllers.editarLibroController.handle(req, res, next),
  );

  return router;
}

export default buildLibrosRouter;
