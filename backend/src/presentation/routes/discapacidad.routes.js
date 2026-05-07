import express from 'express';
import { listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Discapacidad
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
 * const router = buildDiscapacidadRouter({ controllers, middlewares });
 * app.use('/api/v1/discapacidad', router);
 */
export function buildDiscapacidadRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // Catálogo de referencia: `sistema.catalogo.referencia` + LISTAR (seed 101)

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/discapacidad
     * Listar todos los tipos de discapacidad con filtros y paginación
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
        ...listarCatalogoReferencia,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listDiscapacidadController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear tipo de discapacidad
    // router.post(
    //     '/',
    //     createDiscapacidadValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createDiscapacidadController.handle(req, res, next)
    // );

    // GET /:id - Obtener tipo de discapacidad por ID
    // router.get(
    //     '/:id',
    //     getDiscapacidadByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getDiscapacidadByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar tipo de discapacidad
    // router.put(
    //     '/:id',
    //     updateDiscapacidadValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateDiscapacidadController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar tipo de discapacidad (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteDiscapacidadController.handle(req, res, next)
    // );

    return router;
}

