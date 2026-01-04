import express from 'express';
import { listPaisesValidator } from '../validators/geograficos/index.js';

/**
 * Construye el router del módulo Países
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
 * const router = buildPaisesRouter({ controllers, middlewares });
 * app.use('/api/v1/paises', router);
 */
export function buildPaisesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/paises
     * Listar todos los países con filtros y paginación
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
        listPaisesValidator,
        validateRequest,
        (req, res, next) => controllers.listPaisesController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear país
    // router.post(
    //     '/',
    //     createPaisValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createPaisController.handle(req, res, next)
    // );

    // GET /:id - Obtener país por ID
    // router.get(
    //     '/:id',
    //     getPaisByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getPaisByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar país
    // router.put(
    //     '/:id',
    //     updatePaisValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updatePaisController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar país (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deletePaisController.handle(req, res, next)
    // );

    return router;
}

