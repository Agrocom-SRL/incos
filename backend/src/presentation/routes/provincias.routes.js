import express from 'express';
import { listProvinciasValidator } from '../validators/geograficos/index.js';
import validateRequest from '../middleware/validation.middleware.js';

/**
 * Construye el router del módulo Provincias
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
 * const router = buildProvinciasRouter({ controllers, middlewares });
 * app.use('/api/v1/provincias', router);
 */
export function buildProvinciasRouter({ controllers, middlewares }) {
    const router = express.Router();

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/provincias
     * Listar todas las provincias con filtros y paginación
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
        listProvinciasValidator,
        validateRequest,
        (req, res, next) => controllers.listProvinciasController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear provincia
    // router.post(
    //     '/',
    //     createProvinciaValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createProvinciaController.handle(req, res, next)
    // );

    // GET /:id - Obtener provincia por ID
    // router.get(
    //     '/:id',
    //     getProvinciaByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getProvinciaByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar provincia
    // router.put(
    //     '/:id',
    //     updateProvinciaValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateProvinciaController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar provincia (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteProvinciaController.handle(req, res, next)
    // );

    return router;
}

