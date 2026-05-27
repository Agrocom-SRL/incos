import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
    createCarreraValidator,
    updateCarreraValidator,
} from '../validators/configuracion/carreras.validator.js';

/**
 * Construye el router del módulo Carreras
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
 * const router = buildCarrerasRouter({ controllers, middlewares });
 * app.use('/api/v1/carreras', router);
 */
export function buildCarrerasRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarCarreras = [authenticate, verificarPermiso('configuracion.carrera', 'LISTAR')];
    const detalleCarreras = [authenticate, verificarPermiso('configuracion.carrera', 'DETALLE')];
    const crearCarreras = [authenticate, verificarPermiso('configuracion.carrera', 'CREAR')];
    const editarCarreras = [authenticate, verificarPermiso('configuracion.carrera', 'EDITAR')];
    const eliminarCarreras = [authenticate, verificarPermiso('configuracion.carrera', 'ELIMINAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/carreras
     * Listar todas las carreras con filtros y paginación
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
        ...listarCarreras,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listCarrerasController.handle(req, res, next)
    );

    router.post(
        '/',
        ...crearCarreras,
        createCarreraValidator,
        validateRequest,
        (req, res, next) => controllers.createCarreraController.handle(req, res, next)
    );

    router.get(
        '/:id',
        ...detalleCarreras,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getCarreraByIdController.handle(req, res, next)
    );

    router.put(
        '/:id',
        ...editarCarreras,
        idValidator,
        updateCarreraValidator,
        validateRequest,
        (req, res, next) => controllers.updateCarreraController.handle(req, res, next)
    );

    router.delete(
        '/:id',
        ...eliminarCarreras,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteCarreraController.handle(req, res, next)
    );

    return router;
}

