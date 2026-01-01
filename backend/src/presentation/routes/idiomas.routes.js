import express from 'express';
import { listIdiomasValidator } from '../validators/referencia/index.js';
import validateRequest from '../middleware/validation.middleware.js';

/**
 * Construye el router del módulo Idiomas
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
 * const router = buildIdiomasRouter({ controllers, middlewares });
 * app.use('/api/v1/idiomas', router);
 */
export function buildIdiomasRouter({ controllers, middlewares }) {
    const router = express.Router();

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/idiomas
     * Listar todos los idiomas con filtros y paginación
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
        listIdiomasValidator,
        validateRequest,
        (req, res, next) => controllers.listIdiomasController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear idioma
    // router.post(
    //     '/',
    //     createIdiomaValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createIdiomaController.handle(req, res, next)
    // );

    // GET /:id - Obtener idioma por ID
    // router.get(
    //     '/:id',
    //     getIdiomaByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getIdiomaByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar idioma
    // router.put(
    //     '/:id',
    //     updateIdiomaValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateIdiomaController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar idioma (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteIdiomaController.handle(req, res, next)
    // );

    return router;
}

