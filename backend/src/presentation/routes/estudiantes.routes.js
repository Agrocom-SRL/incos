import express from 'express';
import { listValidator } from '../validators/common/index.js';
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
     * Listar todos los estudiantes con filtros y paginación
     * 
     * Query params según IBaseRepository.obtenerTodos:
     * - pagina: número de página (paginación)
     * - limite: cantidad por página (paginación)
     * - busqueda: término de búsqueda general
     * - filtros: filtros específicos del recurso
     * - incluirInactivos: incluir registros inactivos (activo = false)
     */
    router.get(
        '/',
        listValidator, // 1. Validator primero
        validateRequest, // 2. Middleware que procesa errores
        (req, res, next) => controllers.listStudentsController.handle(req, res, next) // 3. Controller al final
    );

    /**
     * POST /api/v1/estudiantes
     * Registrar un nuevo estudiante con todos sus datos relacionados
     * 
     * Body:
     * - student: Datos del estudiante principal
     * - academicData: Datos académicos (opcional)
     * - guardians: Array de apoderados (opcional)
     * - disabilities: Array de discapacidades (opcional)
     * - origins: Array de orígenes (opcional)
     * - documentation: Objeto con entregas de documentos (opcional, keys: doc_1, doc_2, etc.)
     * 
     * Orden de middlewares:
     * 1. registerStudentValidator - Valida estructura y tipos de datos del body
     * 2. validateRequest - Procesa errores de validación y retorna respuesta si hay errores
     * 3. controller - Se ejecuta solo si la validación pasó
     */
    router.post(
        '/',
        registerStudentValidator,  // 1. Validator primero
        validateRequest,            // 2. Middleware que procesa errores
        (req, res, next) => controllers.registerStudentController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // GET /:id - Obtener estudiante por ID
    // router.get(
    //     '/:id',
    //     getStudentByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getStudentByIdController.handle(req, res, next)
    // );

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

