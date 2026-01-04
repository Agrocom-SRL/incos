import express from 'express';
import { listDepartamentosValidator } from '../validators/geograficos/index.js';

/**
 * Construye el router del módulo Departamentos
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
 * const router = buildDepartamentosRouter({ controllers, middlewares });
 * app.use('/api/v1/departamentos', router);
 */
export function buildDepartamentosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/departamentos
     * Listar todos los departamentos con filtros y paginación
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
        listDepartamentosValidator,
        validateRequest,
        (req, res, next) => controllers.listDepartamentosController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear departamento
    // router.post(
    //     '/',
    //     createDepartamentoValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createDepartamentoController.handle(req, res, next)
    // );

    // GET /:id - Obtener departamento por ID
    // router.get(
    //     '/:id',
    //     getDepartamentoByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getDepartamentoByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar departamento
    // router.put(
    //     '/:id',
    //     updateDepartamentoValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateDepartamentoController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar departamento (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteDepartamentoController.handle(req, res, next)
    // );

    return router;
}

