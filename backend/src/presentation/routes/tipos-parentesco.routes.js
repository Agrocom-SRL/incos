import express from 'express';
import { listTiposParentescoValidator } from '../validators/referencia/index.js';
import validateRequest from '../middleware/validation.middleware.js';

/**
 * Construye el router del módulo Tipos de Parentesco
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
 * const router = buildTiposParentescoRouter({ controllers, middlewares });
 * app.use('/api/v1/tipos-parentesco', router);
 */
export function buildTiposParentescoRouter({ controllers, middlewares }) {
    const router = express.Router();

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/tipos-parentesco
     * Listar todos los tipos de parentesco con filtros y paginación
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
        listTiposParentescoValidator,
        validateRequest,
        (req, res, next) => controllers.listTiposParentescoController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear tipo de parentesco
    // router.post(
    //     '/',
    //     createTipoParentescoValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createTipoParentescoController.handle(req, res, next)
    // );

    // GET /:id - Obtener tipo de parentesco por ID
    // router.get(
    //     '/:id',
    //     getTipoParentescoByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getTipoParentescoByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar tipo de parentesco
    // router.put(
    //     '/:id',
    //     updateTipoParentescoValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateTipoParentescoController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar tipo de parentesco (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteTipoParentescoController.handle(req, res, next)
    // );

    return router;
}

