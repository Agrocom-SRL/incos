import express from 'express';
import { listStudentsValidator } from '../validators/estudiantes/index.js';
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
        listStudentsValidator,
        validateRequest,
        (req, res, next) => controllers.listStudentsController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear estudiante
    // router.post(
    //     '/',
    //     registerStudentValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createStudentController.handle(req, res, next)
    // );

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