import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
    createTipoParentescoValidator,
    updateTipoParentescoValidator,
    setEstadoCatalogoValidator,
} from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Tipos de Parentesco
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
 * const router = buildTiposParentescoRouter({ controllers, middlewares });
 * app.use('/api/v1/tipos-parentesco', router);
 */
export function buildTiposParentescoRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // GET /: catálogo de referencia transparente `sistema.catalogo.referencia` + LISTAR (seed 101)
    // POST/GET :id/PUT/DELETE: permiso del módulo (pantalla de administración) `configuracion.complementario.apoderados`
    const detalleTiposParentesco = [authenticate, verificarPermiso('configuracion.complementario.apoderados', 'DETALLE')];
    const crearTiposParentesco = [authenticate, verificarPermiso('configuracion.complementario.apoderados', 'CREAR')];
    const editarTiposParentesco = [authenticate, verificarPermiso('configuracion.complementario.apoderados', 'EDITAR')];
    const eliminarTiposParentesco = [authenticate, verificarPermiso('configuracion.complementario.apoderados', 'ELIMINAR')];
    const activarTiposParentesco = [authenticate, verificarPermiso('configuracion.complementario.apoderados', 'ACTIVAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/tipos-parentesco
     * Listar todos los tipos de parentesco con filtros y paginación
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
        (req, res, next) => controllers.listTiposParentescoController.handle(req, res, next)
    );

    // POST / - Crear tipo de parentesco
    router.post(
        '/',
        ...crearTiposParentesco,
        createTipoParentescoValidator,
        validateRequest,
        (req, res, next) => controllers.createTipoParentescoController.handle(req, res, next)
    );

    // GET /:id - Obtener tipo de parentesco por ID
    router.get(
        '/:id',
        ...detalleTiposParentesco,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getTipoParentescoByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar tipo de parentesco
    router.put(
        '/:id',
        ...editarTiposParentesco,
        idValidator,
        updateTipoParentescoValidator,
        validateRequest,
        (req, res, next) => controllers.updateTipoParentescoController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar tipo de parentesco (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activarTiposParentesco,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoTipoParentescoController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar tipo de parentesco (soft delete)
    router.delete(
        '/:id',
        ...eliminarTiposParentesco,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteTipoParentescoController.handle(req, res, next)
    );

    return router;
}
