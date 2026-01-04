import express from 'express';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Carreras
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
 * const router = buildCarrerasRouter({ controllers, middlewares });
 * app.use('/api/v1/carreras', router);
 */
export function buildCarrerasRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/carreras
     * Listar todas las carreras con filtros y paginación
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
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listCarrerasController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear carrera
    // router.post(
    //     '/',
    //     createCarreraValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createCarreraController.handle(req, res, next)
    // );

    // GET /:id - Obtener carrera por ID
    // router.get(
    //     '/:id',
    //     getCarreraByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getCarreraByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar carrera
    // router.put(
    //     '/:id',
    //     updateCarreraValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateCarreraController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar carrera (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteCarreraController.handle(req, res, next)
    // );

    return router;
}

