import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Gestiones (Académico)
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
 * const router = buildGestionesRouter({ controllers, middlewares });
 * app.use('/api/v1/gestiones', router);
 */
export function buildGestionesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarGestiones = [
        authenticate,
        verificarPermisoCualquiera([
            ['institucional.gestion.actual', 'LISTAR'],
            ['institucional.oferta.gestion-plan', 'LISTAR'],
        ]),
    ];
    const permisoOfertaGestion = 'institucional.oferta.gestion-plan';

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/gestiones
     * Listar todas las gestiones con filtros y paginación
     * 
     * Query params según IBaseRepository.obtenerTodos:
     * - pagina: número de página (paginación)
     * - limite: cantidad por página (paginación)
     * - busqueda: término de búsqueda general
     * - filtros: filtros específicos del recurso (JSON string o objeto)
     *   Ejemplo: filtros={"active":true,"vigente":true}
     * - incluirInactivos: incluir registros inactivos (activo = false)
     */
    router.get(
        '/',
        ...listarGestiones,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listGestionesController.handle(req, res, next)
    );

    router.post(
        '/:id/marcar-vigente',
        authenticate,
        verificarPermiso(permisoOfertaGestion, 'ACTIVAR'),
        idValidator,
        validateRequest,
        (req, res, next) => controllers.marcarGestionVigenteController.handle(req, res, next)
    );

    router.get(
        '/:id/planes-habilitados',
        authenticate,
        verificarPermiso(permisoOfertaGestion, 'LISTAR'),
        idValidator,
        validateRequest,
        (req, res, next) => controllers.listPlanesHabilitadosByGestionController.handle(req, res, next)
    );

    router.get(
        '/:id/carga-docentes',
        authenticate,
        verificarPermisoCualquiera([
            ['institucional.horarios.carga-docente', 'LISTAR'],
            ['institucional.horarios.asignacion-docente', 'LISTAR'],
            ['docentes.asignar', 'EDITAR'],
        ]),
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getGestionCargaDocentesController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear gestión
    // router.post(
    //     '/',
    //     createGestionValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createGestionController.handle(req, res, next)
    // );

    // GET /:id - Obtener gestión por ID
    // router.get(
    //     '/:id',
    //     getGestionByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getGestionByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar gestión
    // router.put(
    //     '/:id',
    //     updateGestionValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateGestionController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar gestión (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteGestionController.handle(req, res, next)
    // );

    return router;
}
