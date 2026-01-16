import express from 'express';
import { listValidator, idValidator, searchValidator } from '../validators/common/index.js';
import { registerStudentValidator, updateStudentValidator, assignBecaValidator } from '../validators/estudiantes/index.js';

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

    /**
     * PUT /api/v1/estudiantes/:id
     * Actualizar estudiante existente con todos sus datos relacionados
     * Path: id (ID del estudiante)
     * Body: student (opcional - actualización parcial), guardians (opcional - reemplazo completo),
     *       disabilities (opcional - reemplazo completo), origins (opcional - reemplazo completo),
     *       documentation (opcional - reemplazo completo)
     * 
     * NOTA: Similar a RegisterStudentUseCase, actualiza estudiante y todas sus relaciones.
     * - Datos básicos: actualización parcial (solo campos proporcionados)
     * - Relaciones: reemplazo completo (si se proporcionan, elimina todas las existentes y crea las nuevas)
     */
    router.put(
        '/:id',
        idValidator,  // 1. Validator primero
        updateStudentValidator,  // 2. Validator de datos del body
        validateRequest,  // 3. Middleware que procesa errores
        (req, res, next) => controllers.updateStudentController.handle(req, res, next)  // 4. Controller al final
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
    // ASIGNACIÓN DE BECAS
    // ============================================

    /**
     * POST /api/v1/estudiantes/:id/scholarships
     * Asignar una beca/descuento a un estudiante
     * Path: id (ID del estudiante)
     * Body: student_id, scholarship_id, observations? (opcional)
     * 
     * NOTA: La gestión se obtiene automáticamente de la configuración del sistema.
     * La fecha de solicitud se establece automáticamente como la fecha actual.
     * El estado se establece automáticamente como PENDIENTE.
     */
    router.post(
        '/:id/scholarships',
        assignBecaValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.asignarBecaController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // BÚSQUEDA DE ESTUDIANTE
    // ============================================

    /**
     * GET /api/v1/estudiantes/search
     * Buscar estudiante por texto libre
     * Query: query (busca en codigo, ci, nombres, apellidos), limit (opcional)
     */
    router.get(
        '/search',
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

    // DELETE /:id - Eliminar estudiante (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteStudentController.handle(req, res, next)
    // );

    return router;
}

