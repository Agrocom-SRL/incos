import express from 'express';
import { listEstadosCivilesValidator } from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Estados Civiles
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
 * const router = buildEstadosCivilesRouter({ controllers, middlewares });
 * app.use('/api/v1/estados-civiles', router);
 */
export function buildEstadosCivilesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/estados-civiles
     * Listar todos los estados civiles con filtros y paginación
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
        listEstadosCivilesValidator,
        validateRequest,
        (req, res, next) => controllers.listEstadosCivilesController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear estado civil
    // router.post(
    //     '/',
    //     createEstadoCivilValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createEstadoCivilController.handle(req, res, next)
    // );

    // GET /:id - Obtener estado civil por ID
    // router.get(
    //     '/:id',
    //     getEstadoCivilByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getEstadoCivilByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar estado civil
    // router.put(
    //     '/:id',
    //     updateEstadoCivilValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateEstadoCivilController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar estado civil (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteEstadoCivilController.handle(req, res, next)
    // );

    return router;
}

