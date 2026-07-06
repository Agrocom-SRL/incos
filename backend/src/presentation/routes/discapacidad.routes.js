import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
    createDiscapacidadValidator,
    updateDiscapacidadValidator,
} from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Discapacidad
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
 * const router = buildDiscapacidadRouter({ controllers, middlewares });
 * app.use('/api/v1/discapacidad', router);
 */
export function buildDiscapacidadRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // GET /: catálogo de referencia transparente `sistema.catalogo.referencia` + LISTAR (seed 101)
    // POST/GET :id/PUT/DELETE: permiso del módulo (pantalla de administración) `configuracion.complementario.discapacidad`
    const detalleDiscapacidad = [authenticate, verificarPermiso('configuracion.complementario.discapacidad', 'DETALLE')];
    const crearDiscapacidad = [authenticate, verificarPermiso('configuracion.complementario.discapacidad', 'CREAR')];
    const editarDiscapacidad = [authenticate, verificarPermiso('configuracion.complementario.discapacidad', 'EDITAR')];
    const eliminarDiscapacidad = [authenticate, verificarPermiso('configuracion.complementario.discapacidad', 'ELIMINAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/discapacidad
     * Listar todos los tipos de discapacidad con filtros y paginación
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
        (req, res, next) => controllers.listDiscapacidadController.handle(req, res, next)
    );

    // POST / - Crear tipo de discapacidad
    router.post(
        '/',
        ...crearDiscapacidad,
        createDiscapacidadValidator,
        validateRequest,
        (req, res, next) => controllers.createDiscapacidadController.handle(req, res, next)
    );

    // GET /:id - Obtener tipo de discapacidad por ID
    router.get(
        '/:id',
        ...detalleDiscapacidad,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getDiscapacidadByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar tipo de discapacidad
    router.put(
        '/:id',
        ...editarDiscapacidad,
        idValidator,
        updateDiscapacidadValidator,
        validateRequest,
        (req, res, next) => controllers.updateDiscapacidadController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar tipo de discapacidad (soft delete)
    router.delete(
        '/:id',
        ...eliminarDiscapacidad,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteDiscapacidadController.handle(req, res, next)
    );

    return router;
}
