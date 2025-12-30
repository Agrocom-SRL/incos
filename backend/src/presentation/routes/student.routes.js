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

/**
 * Construye el router del módulo Estudiantes
 * 
 * Responsabilidades:
 * - Definir rutas y métodos HTTP
 * - Vincular validators y middlewares
 * - Delegar lógica a controllers inyectados
 * 
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (upload, auth, etc.)
 * @returns {Router} Router configurado de Express
 * 
 * @example
 * const router = buildStudentRouter({ controllers, middlewares });
 * app.use('/api/v1/estudiantes', router);
 */
export function buildStudentRouter({ controllers, middlewares }) {
    const router = express.Router();

    // ============================================
    // CRUD BÁSICO
    // ============================================

    router.post(
        '/',
        registerStudentValidator,
        validateRequest,
        (req, res, next) => controllers.createStudentController.handle(req, res, next)
    );

    router.get(
        '/',
        listStudentsValidator,
        validateRequest,
        (req, res, next) => controllers.listStudentsController.handle(req, res, next)
    );

    // Rutas específicas ANTES de /:id (para evitar conflictos)
    router.get(
        '/summary',
        (req, res, next) => controllers.getStudentsSummaryController?.handle(req, res, next) || res.status(501).json({ success: false, error: 'Endpoint en construcción' })
    );

    router.get(
        '/becas',
        (req, res, next) => controllers.listBecasController?.handle(req, res, next) || res.status(501).json({ success: false, error: 'Endpoint en construcción' })
    );

    router.get(
        '/licencias',
        (req, res, next) => controllers.listLicenciasController?.handle(req, res, next) || res.status(501).json({ success: false, error: 'Endpoint en construcción' })
    );

    router.get(
        '/documentos',
        (req, res, next) => controllers.listAllDocumentsController?.handle(req, res, next) || res.status(501).json({ success: false, error: 'Endpoint en construcción' })
    );

    router.get(
        '/:id',
        getStudentByIdValidator,
        validateRequest,
        (req, res, next) => controllers.getStudentByIdController.handle(req, res, next)
    );

    router.put(
        '/:id',
        updateStudentValidator,
        validateRequest,
        (req, res, next) => controllers.updateStudentController.handle(req, res, next)
    );

    // ============================================
    // DOCUMENTOS
    // ============================================

    router.get(
        '/:id/documentos',
        (req, res, next) => controllers.getStudentDocumentsController.handle(req, res, next)
    );

    router.post(
        '/:id/documentos',
        middlewares.uploadStudentDocument,
        (req, res, next) => controllers.uploadDocumentController.handle(req, res, next)
    );

    router.get(
        '/:id/entregas-documentos',
        (req, res, next) => controllers.getStudentDocumentDeliveriesController.handle(req, res, next)
    );

    // ============================================
    // DATOS ACADÉMICOS
    // ============================================

    router.get(
        '/:id/datos-academicos',
        (req, res, next) => controllers.getStudentAcademicDataController.handle(req, res, next)
    );

    router.patch(
        '/:id/estado',
        changeStudentStatusValidator,
        validateRequest,
        (req, res, next) => controllers.changeStudentStatusController.handle(req, res, next)
    );

    // ============================================
    // BECAS Y LICENCIAS
    // ============================================

    // Becas (rutas específicas de estudiante)
    router.post(
        '/:id/becas',
        assignBecaValidator,
        validateRequest,
        (req, res, next) => controllers.assignBecaController.handle(req, res, next)
    );

    router.patch(
        '/:id/becas/:becaId/aprobar',
        (req, res, next) => controllers.approveBecaController?.handle(req, res, next) || res.status(501).json({ success: false, error: 'Endpoint en construcción' })
    );

    // Licencias (rutas específicas de estudiante)
    router.post(
        '/:id/licencias',
        requestLicenciaValidator,
        validateRequest,
        (req, res, next) => controllers.requestLicenciaController.handle(req, res, next)
    );

    router.patch(
        '/:id/licencias/:licenciaId/aprobar',
        (req, res, next) => controllers.approveLicenciaController?.handle(req, res, next) || res.status(501).json({ success: false, error: 'Endpoint en construcción' })
    );

    // ============================================
    // REPORTES
    // ============================================

    router.get(
        '/:id/acta-compromiso',
        (req, res, next) => controllers.generateCompromisoActaController.handle(req, res, next)
    );

    return router;
}