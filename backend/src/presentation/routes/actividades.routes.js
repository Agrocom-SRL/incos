import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listActividadesValidator,
    createActividadValidator,
    updateActividadValidator,
} from '../validators/configuracion/actividades.validator.js';
import { setEstadoCatalogoValidator } from '../validators/configuracion/set-estado.validator.js';

/**
 * Construye el router del módulo Actividades (catálogo maestro)
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
 * const router = buildActividadesRouter({ controllers, middlewares });
 * app.use('/api/v1/actividades', router);
 */
export function buildActividadesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarActividades = [authenticate, verificarPermiso('configuracion.actividad', 'LISTAR')];
    const detalleActividades = [authenticate, verificarPermiso('configuracion.actividad', 'DETALLE')];
    const crearActividades = [authenticate, verificarPermiso('configuracion.actividad', 'CREAR')];
    const editarActividades = [authenticate, verificarPermiso('configuracion.actividad', 'EDITAR')];
    const eliminarActividades = [authenticate, verificarPermiso('configuracion.actividad', 'ELIMINAR')];
    const activarActividades = [authenticate, verificarPermiso('configuracion.actividad', 'ACTIVAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/actividades
     * Listar todas las actividades con filtros y paginación
     *
     * Query params según IBaseRepository.obtenerTodos:
     * - pagina: número de página (paginación)
     * - limite: cantidad por página (paginación)
     * - busqueda: término de búsqueda general
     * - tipo: filtro por tipo de actividad (opcional)
     * - esDestacada: filtro por destacada (opcional)
     * - incluirInactivos: incluir registros inactivos (activo = false)
     */
    router.get(
        '/',
        ...listarActividades,
        listActividadesValidator,
        validateRequest,
        (req, res, next) => controllers.listActividadesController.handle(req, res, next)
    );

    // POST / - Crear actividad
    router.post(
        '/',
        ...crearActividades,
        createActividadValidator,
        validateRequest,
        (req, res, next) => controllers.createActividadController.handle(req, res, next)
    );

    // GET /:id - Obtener actividad por ID
    router.get(
        '/:id',
        ...detalleActividades,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getActividadByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar actividad
    router.put(
        '/:id',
        ...editarActividades,
        idValidator,
        updateActividadValidator,
        validateRequest,
        (req, res, next) => controllers.updateActividadController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar actividad (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activarActividades,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoActividadController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar actividad (soft delete)
    router.delete(
        '/:id',
        ...eliminarActividades,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteActividadController.handle(req, res, next)
    );

    return router;
}
