import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import {
    createBecaDescuentoValidator,
    updateBecaDescuentoValidator,
} from '../validators/estudiantes/index.js';

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
    // GET /: catálogo de referencia transparente `sistema.catalogo.referencia` + LISTAR
    // POST/GET :id/PUT/DELETE: permiso del catálogo maestro `finanzas.beca-descuento`
    const crearBeca = [authenticate, verificarPermiso('finanzas.beca-descuento', 'CREAR')];
    const detalleBeca = [authenticate, verificarPermiso('finanzas.beca-descuento', 'DETALLE')];
    const editarBeca = [authenticate, verificarPermiso('finanzas.beca-descuento', 'EDITAR')];
    const eliminarBeca = [authenticate, verificarPermiso('finanzas.beca-descuento', 'ELIMINAR')];

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
        ...listarCatalogoReferencia,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listBecasDescuentosController.handle(req, res, next)
    );

    // POST / - Crear beca/descuento
    router.post(
        '/',
        ...crearBeca,
        createBecaDescuentoValidator,
        validateRequest,
        (req, res, next) => controllers.createBecaDescuentoController.handle(req, res, next)
    );

    // GET /:id - Obtener beca/descuento por ID
    router.get(
        '/:id',
        ...detalleBeca,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getBecaDescuentoByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar beca/descuento
    router.put(
        '/:id',
        ...editarBeca,
        idValidator,
        updateBecaDescuentoValidator,
        validateRequest,
        (req, res, next) => controllers.updateBecaDescuentoController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar beca/descuento (soft delete)
    router.delete(
        '/:id',
        ...eliminarBeca,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteBecaDescuentoController.handle(req, res, next)
    );

    return router;
}
