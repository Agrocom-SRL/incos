import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
    createEstadoCivilValidator,
    updateEstadoCivilValidator,
    setEstadoCatalogoValidator,
} from '../validators/referencia/index.js';

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
    // GET /: catálogo de referencia transparente `sistema.catalogo.referencia` + LISTAR (seed 101)
    // POST/GET :id/PUT/DELETE: permiso del módulo (pantalla de administración) `configuracion.complementario.estado-civil`
    const detalleEstadosCiviles = [authenticate, verificarPermiso('configuracion.complementario.estado-civil', 'DETALLE')];
    const crearEstadosCiviles = [authenticate, verificarPermiso('configuracion.complementario.estado-civil', 'CREAR')];
    const editarEstadosCiviles = [authenticate, verificarPermiso('configuracion.complementario.estado-civil', 'EDITAR')];
    const eliminarEstadosCiviles = [authenticate, verificarPermiso('configuracion.complementario.estado-civil', 'ELIMINAR')];
    const activarEstadosCiviles = [authenticate, verificarPermiso('configuracion.complementario.estado-civil', 'ACTIVAR')];

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
        ...listarCatalogoReferencia,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listEstadosCivilesController.handle(req, res, next)
    );

    // POST / - Crear estado civil
    router.post(
        '/',
        ...crearEstadosCiviles,
        createEstadoCivilValidator,
        validateRequest,
        (req, res, next) => controllers.createEstadoCivilController.handle(req, res, next)
    );

    // GET /:id - Obtener estado civil por ID
    router.get(
        '/:id',
        ...detalleEstadosCiviles,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getEstadoCivilByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar estado civil
    router.put(
        '/:id',
        ...editarEstadosCiviles,
        idValidator,
        updateEstadoCivilValidator,
        validateRequest,
        (req, res, next) => controllers.updateEstadoCivilController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar estado civil (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activarEstadosCiviles,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoEstadoCivilController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar estado civil (soft delete)
    router.delete(
        '/:id',
        ...eliminarEstadosCiviles,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteEstadoCivilController.handle(req, res, next)
    );

    return router;
}
