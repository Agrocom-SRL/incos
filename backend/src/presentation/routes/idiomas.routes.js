import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
    createIdiomaValidator,
    updateIdiomaValidator,
} from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Idiomas
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
 * const router = buildIdiomasRouter({ controllers, middlewares });
 * app.use('/api/v1/idiomas', router);
 */
export function buildIdiomasRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // GET /: catálogo de referencia transparente `sistema.catalogo.referencia` + LISTAR (seed 101)
    // POST/GET :id/PUT/DELETE: permiso del módulo (pantalla de administración) `configuracion.complementario.idiomas`
    const detalleIdiomas = [authenticate, verificarPermiso('configuracion.complementario.idiomas', 'DETALLE')];
    const crearIdiomas = [authenticate, verificarPermiso('configuracion.complementario.idiomas', 'CREAR')];
    const editarIdiomas = [authenticate, verificarPermiso('configuracion.complementario.idiomas', 'EDITAR')];
    const eliminarIdiomas = [authenticate, verificarPermiso('configuracion.complementario.idiomas', 'ELIMINAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/idiomas
     * Listar todos los idiomas con filtros y paginación
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
        (req, res, next) => controllers.listIdiomasController.handle(req, res, next)
    );

    // POST / - Crear idioma
    router.post(
        '/',
        ...crearIdiomas,
        createIdiomaValidator,
        validateRequest,
        (req, res, next) => controllers.createIdiomaController.handle(req, res, next)
    );

    // GET /:id - Obtener idioma por ID
    router.get(
        '/:id',
        ...detalleIdiomas,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getIdiomaByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar idioma
    router.put(
        '/:id',
        ...editarIdiomas,
        idValidator,
        updateIdiomaValidator,
        validateRequest,
        (req, res, next) => controllers.updateIdiomaController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar idioma (soft delete)
    router.delete(
        '/:id',
        ...eliminarIdiomas,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteIdiomaController.handle(req, res, next)
    );

    return router;
}
