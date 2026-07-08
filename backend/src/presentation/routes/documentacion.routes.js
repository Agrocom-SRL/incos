import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listDocumentacionValidator,
    createDocumentacionValidator,
    updateDocumentacionValidator,
    setEstadoCatalogoValidator,
} from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Documentación
 *
 * Catálogo ÚNICO de todos los tipos de documento (ENUM tipo_documento de 9
 * valores: INSCRIPCION, LICENCIA, PASANTIA, DESCUENTO, TITULACION, TRASPASO,
 * TRANSITABILIDAD, BECA, OTRO) administrado desde una sola pantalla con el
 * permiso `configuracion.documentacion` (sin segmentar por tipoDocumento).
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
 * const router = buildDocumentacionRouter({ controllers, middlewares });
 * app.use('/api/v1/documentacion', router);
 */
export function buildDocumentacionRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const detalleDocumentacion = [authenticate, verificarPermiso('configuracion.documentacion', 'DETALLE')];
    const crearDocumentacion = [authenticate, verificarPermiso('configuracion.documentacion', 'CREAR')];
    const editarDocumentacion = [authenticate, verificarPermiso('configuracion.documentacion', 'EDITAR')];
    const eliminarDocumentacion = [authenticate, verificarPermiso('configuracion.documentacion', 'ELIMINAR')];
    const activarDocumentacion = [authenticate, verificarPermiso('configuracion.documentacion', 'ACTIVAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/documentacion
     * Listar todos los tipos de documentación con filtros y paginación
     *
     * Catálogo de referencia transparente (`sistema.catalogo.referencia` +
     * LISTAR): lo consumen también los combos de matrícula/becas, por eso no
     * exige `configuracion.documentacion`.
     *
     * Query params según IBaseRepository.obtenerTodos:
     * - pagina: número de página (paginación)
     * - limite: cantidad por página (paginación)
     * - busqueda: término de búsqueda general
     * - tipoDocumento: filtro por tipo de documento (opcional)
     * - incluirInactivos: incluir registros inactivos (activo = false)
     */
    router.get(
        '/',
        ...listarCatalogoReferencia,
        listDocumentacionValidator,
        validateRequest,
        (req, res, next) => controllers.listDocumentacionController.handle(req, res, next)
    );

    // POST / - Crear tipo de documentación
    router.post(
        '/',
        ...crearDocumentacion,
        createDocumentacionValidator,
        validateRequest,
        (req, res, next) => controllers.createDocumentacionController.handle(req, res, next)
    );

    // GET /:id - Obtener tipo de documentación por ID
    router.get(
        '/:id',
        ...detalleDocumentacion,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getDocumentacionByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar tipo de documentación
    router.put(
        '/:id',
        ...editarDocumentacion,
        idValidator,
        updateDocumentacionValidator,
        validateRequest,
        (req, res, next) => controllers.updateDocumentacionController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar tipo de documentación (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activarDocumentacion,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoDocumentacionController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar tipo de documentación (soft delete)
    router.delete(
        '/:id',
        ...eliminarDocumentacion,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteDocumentacionController.handle(req, res, next)
    );

    return router;
}
