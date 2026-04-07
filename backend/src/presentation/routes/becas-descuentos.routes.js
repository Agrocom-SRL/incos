import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Becas y Descuentos
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
 * const router = buildBecasDescuentosRouter({ controllers, middlewares });
 * app.use('/api/v1/becas-descuentos', router);
 */
export function buildBecasDescuentosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const verBeca = [authenticate, verificarPermiso('matricula.beca.ver', 'VER')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/becas-descuentos
     * Listar todas las becas y descuentos con filtros y paginación
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
        ...verBeca,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listBecasDescuentosController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear beca/descuento
    // router.post(
    //     '/',
    //     createBecaDescuentoValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createBecaDescuentoController.handle(req, res, next)
    // );

    // GET /:id - Obtener beca/descuento por ID
    // router.get(
    //     '/:id',
    //     getBecaDescuentoByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getBecaDescuentoByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar beca/descuento
    // router.put(
    //     '/:id',
    //     updateBecaDescuentoValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateBecaDescuentoController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar beca/descuento (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteBecaDescuentoController.handle(req, res, next)
    // );

    return router;
}
