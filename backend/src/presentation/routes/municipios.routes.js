import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listMunicipiosValidator } from '../validators/geograficos/index.js';

/**
 * Construye el router del módulo Municipios
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
 * const router = buildMunicipiosRouter({ controllers, middlewares });
 * app.use('/api/v1/municipios', router);
 */
export function buildMunicipiosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const catalogoMatricula = [authenticate, verificarPermiso('matricula.admision.ver', 'VER')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/municipios
     * Listar todos los municipios con filtros y paginación
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
        ...catalogoMatricula,
        listMunicipiosValidator,
        validateRequest,
        (req, res, next) => controllers.listMunicipiosController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear municipio
    // router.post(
    //     '/',
    //     createMunicipioValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createMunicipioController.handle(req, res, next)
    // );

    // GET /:id - Obtener municipio por ID
    // router.get(
    //     '/:id',
    //     getMunicipioByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getMunicipioByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar municipio
    // router.put(
    //     '/:id',
    //     updateMunicipioValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateMunicipioController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar municipio (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteMunicipioController.handle(req, res, next)
    // );

    return router;
}

