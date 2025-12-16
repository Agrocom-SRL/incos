import express from 'express';
import {
  registerStudentValidator,
  listStudentsValidator,
  getStudentByIdValidator,
  updateStudentValidator,
  changeStudentStatusValidator,
  assignBecaValidator,
  requestLicenciaValidator,
} from '../validators/estudiantes/index.js';
import validateRequest from '../middleware/validation.middleware.js';
import container from '../../infrastructure/container/index.js';
import { uploadSingle, UploadDocumentController } from '../controllers/estudiantes/upload-document.controller.js';
import { logger } from '../../shared/logger.js';

const router = express.Router();

// Obtener controladores desde el contenedor de DI
const createStudentController = container.resolve(
  'estudiantes.createStudentController'
);
const listStudentsController = container.resolve(
  'estudiantes.listStudentsController'
);
const getStudentByIdController = container.resolve(
  'estudiantes.getStudentByIdController'
);
const updateStudentController = container.resolve(
  'estudiantes.updateStudentController'
);
const changeStudentStatusController = container.resolve(
  'estudiantes.changeStudentStatusController'
);
const assignBecaController = container.resolve(
  'estudiantes.assignBecaController'
);
const requestLicenciaController = container.resolve(
  'estudiantes.requestLicenciaController'
);
const uploadDocumentController = new UploadDocumentController({
  uploadDocumentUseCase: null, // TODO: Implementar use case
});

/**
 * POST /api/v1/estudiantes
 * Registrar nuevo estudiante
 * Permisos: estudiantes.crear
 */
router.post(
  '/',
  // authMiddleware, // TODO: Implementar middleware de autenticación
  registerStudentValidator,
  validateRequest,
  (req, res, next) => createStudentController.handle(req, res, next)
);

/**
 * GET /api/v1/estudiantes
 * Listar estudiantes con filtros y paginación
 * Permisos: estudiantes.ver
 */
router.get(
  '/',
  // authMiddleware,
  listStudentsValidator,
  validateRequest,
  (req, res, next) => listStudentsController.handle(req, res, next)
);

/**
 * POST /api/v1/estudiantes/:id/documentos
 * Subir documento de estudiante
 * Permisos: estudiantes.documentos.subir
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para que Express la capture correctamente
 */
router.post(
  '/:id/documentos',
  // authMiddleware,
  (req, res, next) => {
    // Log para verificar que la ruta se está capturando
    logger.info('Ruta /:id/documentos capturada', {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      params: req.params,
      hasFile: !!req.file,
    });
    next();
  },
  uploadSingle,
  (req, res, next) => {
    // Log después de multer
    logger.info('Después de multer middleware', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
      } : null,
    });
    uploadDocumentController.handle(req, res, next);
  }
);

/**
 * PATCH /api/v1/estudiantes/:id/estado
 * Cambiar estado académico del estudiante
 * Permisos: estudiantes.cambiar_estado
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para que Express la capture correctamente
 */
router.patch(
  '/:id/estado',
  // authMiddleware,
  changeStudentStatusValidator,
  validateRequest,
  (req, res, next) => changeStudentStatusController.handle(req, res, next)
);

/**
 * POST /api/v1/estudiantes/:id/becas
 * Asignar beca a un estudiante
 * Permisos: estudiantes.becas.gestionar
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para que Express la capture correctamente
 */
router.post(
  '/:id/becas',
  // authMiddleware,
  assignBecaValidator,
  validateRequest,
  (req, res, next) => assignBecaController.handle(req, res, next)
);

/**
 * POST /api/v1/estudiantes/:id/licencias
 * Solicitar licencia estudiantil
 * Permisos: estudiantes.licencias.solicitar o estudiantes.licencias.gestionar
 * IMPORTANTE: Esta ruta debe estar ANTES de /:id para que Express la capture correctamente
 */
router.post(
  '/:id/licencias',
  // authMiddleware,
  requestLicenciaValidator,
  validateRequest,
  (req, res, next) => requestLicenciaController.handle(req, res, next)
);

/**
 * GET /api/v1/estudiantes/:id
 * Obtener detalle completo de un estudiante
 * Permisos: estudiantes.ver
 * IMPORTANTE: Esta ruta debe estar DESPUÉS de todas las rutas específicas como /:id/documentos
 */
router.get(
  '/:id',
  // authMiddleware,
  getStudentByIdValidator,
  validateRequest,
  (req, res, next) => getStudentByIdController.handle(req, res, next)
);

/**
 * PUT /api/v1/estudiantes/:id
 * Actualizar datos de un estudiante
 * Permisos: estudiantes.editar
 * IMPORTANTE: Esta ruta debe estar DESPUÉS de todas las rutas específicas como /:id/documentos
 */
router.put(
  '/:id',
  // authMiddleware,
  updateStudentValidator,
  validateRequest,
  (req, res, next) => updateStudentController.handle(req, res, next)
);

export default router;
