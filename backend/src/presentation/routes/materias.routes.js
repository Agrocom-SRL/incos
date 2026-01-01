import express from 'express';
import { listMateriasValidator } from '../validators/configuracion/index.js';
import validateRequest from '../middleware/validation.middleware.js';

/**
 * Construye el router del módulo Materias
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
 * const router = buildMateriasRouter({ controllers, middlewares });
 * app.use('/api/v1/materias', router);
 */
export function buildMateriasRouter({ controllers, middlewares }) {
    const router = express.Router();

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/materias
     * Listar todas las materias con filtros y paginación
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
        listMateriasValidator,
        validateRequest,
        (req, res, next) => controllers.listMateriasController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear materia
    // router.post(
    //     '/',
    //     createMateriaValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createMateriaController.handle(req, res, next)
    // );

    // GET /:id - Obtener materia por ID
    // router.get(
    //     '/:id',
    //     getMateriaByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getMateriaByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar materia
    // router.put(
    //     '/:id',
    //     updateMateriaValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateMateriaController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar materia (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteMateriaController.handle(req, res, next)
    // );

    return router;
}

