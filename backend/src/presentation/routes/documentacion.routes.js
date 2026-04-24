import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listDocumentacionValidator } from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Documentación
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
 * const router = buildDocumentacionRouter({ controllers, middlewares });
 * app.use('/api/v1/documentacion', router);
 */
export function buildDocumentacionRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // Catálogo de referencia: solo autenticación requerida, sin permiso específico

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/documentacion
     * Listar todos los tipos de documentación con filtros y paginación
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
        authenticate,
        listDocumentacionValidator,
        validateRequest,
        (req, res, next) => controllers.listDocumentacionController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear tipo de documentación
    // router.post(
    //     '/',
    //     createDocumentacionValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createDocumentacionController.handle(req, res, next)
    // );

    // GET /:id - Obtener tipo de documentación por ID
    // router.get(
    //     '/:id',
    //     getDocumentacionByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getDocumentacionByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar tipo de documentación
    // router.put(
    //     '/:id',
    //     updateDocumentacionValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateDocumentacionController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar tipo de documentación (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteDocumentacionController.handle(req, res, next)
    // );

    return router;
}

