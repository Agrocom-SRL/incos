import express from 'express';
import { listValidator, idValidator, searchValidator } from '../validators/common/index.js';
import { registerStudentValidator } from '../validators/estudiantes/index.js';

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
 * @param {Object} params.middlewares - Middlewares (validateRequest, upload, auth, etc.)
 * @returns {Router} Router configurado de Express
 * 
 * @example
 * const router = buildEstudiantesRouter({ controllers, middlewares });
 * app.use('/api/v1/estudiantes', router);
 */
export function buildEstudiantesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/estudiantes
     * Listar estudiantes con filtros y paginación
     * Query: page, limit, search
     */
    router.get(
        '/',
        listValidator, // 1. Validator primero
        validateRequest, // 2. Middleware que procesa errores
        (req, res, next) => controllers.listStudentsController.handle(req, res, next) // 3. Controller al final
    );

    /**
     * POST /api/v1/estudiantes
     * Registrar nuevo estudiante con datos relacionados
     * Body: student, guardians, disabilities, origins, documentation
     */
    router.post(
        '/',
        registerStudentValidator,  // 1. Validator primero
        validateRequest,            // 2. Middleware que procesa errores
        (req, res, next) => controllers.registerStudentController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // GENERACIÓN DE DOCUMENTOS
    // ============================================

    /**
     * POST /api/v1/estudiantes/:id/documentos/acta-compromiso
     * Generar acta de compromiso para un estudiante
     * Path: id
     */
    router.post(
        '/:id/documentos/acta-compromiso',
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.actaCompromisoController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // BÚSQUEDA DE ESTUDIANTE
    // ============================================

    /**
     * GET /api/v1/estudiantes/buscar
     * Buscar estudiante por texto libre
     * Query: search (busca en codigo, ci, nombres, apellidos)
     */
    router.get(
        '/buscar',
        searchValidator,  // 1. Validator común de búsqueda
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.searchStudentController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // OBTENCIÓN DE ESTUDIANTE POR ID
    // ============================================

    /**
     * GET /api/v1/estudiantes/:id
     * Obtener estudiante por ID con datos relacionados
     * Path: id
     */
    router.get(
        '/:id',
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.getStudentByIdController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // PUT /:id - Actualizar estudiante
    // router.put(
    //     '/:id',
    //     updateStudentValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateStudentController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar estudiante (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteStudentController.handle(req, res, next)
    // );

    return router;
}

