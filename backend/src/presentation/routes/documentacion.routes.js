import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { getAppContainer } from '../middleware/container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { idValidator } from '../validators/common/index.js';
import {
    listDocumentacionValidator,
    createDocumentacionValidator,
    updateDocumentacionValidator,
} from '../validators/referencia/index.js';

/**
 * Mapa tipoDocumento (ENUM) → código de permiso segmentado
 *
 * El modelo `documentacion` es UNA sola tabla con un ENUM `tipoDocumento` de 9
 * valores, pero el permiso está segmentado por pantalla de administración
 * (solo 4 tipos tienen pantalla propia hoy: inscripción, becas, pasantías,
 * traslado). Los 5 valores restantes (LICENCIA, DESCUENTO, TITULACION,
 * TRANSITABILIDAD, OTRO) no tienen código de permiso propio: se DENIEGA el
 * acceso con un mensaje explícito en vez de exponerlos sin control de acceso
 * real, hasta que exista una pantalla de administración para ellos.
 *
 * @param {string} tipoDocumento - Valor del ENUM tipo_documento
 * @returns {string|null} Código de permiso o null si no tiene pantalla propia
 */
export function resolverPermisoDocumentacion(tipoDocumento) {
    const MAPA_PERMISO_POR_TIPO = {
        INSCRIPCION: 'configuracion.documentacion.inscripcion',
        BECA: 'configuracion.documentacion.becas',
        PASANTIA: 'configuracion.documentacion.pasantias',
        TRASPASO: 'configuracion.documentacion.traslado',
    };
    return MAPA_PERMISO_POR_TIPO[tipoDocumento] ?? null;
}

/**
 * Verifica el permiso segmentado por tipoDocumento resuelto (ya conocido)
 * @param {string} tipoDocumento
 * @param {string} accion
 */
function verificarAccionPorTipoDocumento(tipoDocumento, accion) {
    return async (req, res, next) => {
        try {
            const codigo = resolverPermisoDocumentacion(tipoDocumento);
            if (!codigo) {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    detalle: `El tipo de documento "${tipoDocumento}" no tiene una pantalla de administración habilitada`,
                });
            }

            const authRepository = getAppContainer().resolve(REPOSITORIOS_TOKENS.authRepository);
            const tiene = await authRepository.tienePermiso(req.usuario.id, codigo, accion);
            if (!tiene) {
                return res.status(403).json({ error: 'Acceso denegado', codigo, accion });
            }
            return next();
        } catch (error) {
            return next(error);
        }
    };
}

/**
 * Gate de CREAR: el tipoDocumento viene en el body (aún no existe el registro)
 */
function verificarPermisoDocumentacionCrear(req, res, next) {
    const tipoDocumento = req.body?.tipoDocumento;
    if (!tipoDocumento) {
        return res.status(422).json({ error: 'tipoDocumento es requerido' });
    }
    return verificarAccionPorTipoDocumento(tipoDocumento, 'CREAR')(req, res, next);
}

/**
 * Gate de DETALLE/EDITAR/ELIMINAR: el tipoDocumento se resuelve cargando el
 * registro existente por :id (no viene en el body de PUT/DELETE/GET)
 * @param {string} accion
 */
function verificarPermisoDocumentacionExistente(accion) {
    return async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const documentacionRepository = getAppContainer().resolve(REPOSITORIOS_TOKENS.documentationRepository);
            const registro = await documentacionRepository.findById(id, { paranoid: false });
            if (!registro) {
                return res.status(404).json({ error: 'Recurso no encontrado', resource: 'tipo de documentación', id });
            }
            return verificarAccionPorTipoDocumento(registro.documentType, accion)(req, res, next);
        } catch (error) {
            return next(error);
        }
    };
}

/**
 * Construye el router del módulo Documentación
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
    // GET /: catálogo de referencia transparente `sistema.catalogo.referencia` + LISTAR (seed 101)
    // POST/GET :id/PUT/DELETE: permiso segmentado por tipoDocumento (ver resolverPermisoDocumentacion)

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/documentacion
     * Listar todos los tipos de documentación con filtros y paginación
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
        listDocumentacionValidator,
        validateRequest,
        (req, res, next) => controllers.listDocumentacionController.handle(req, res, next)
    );

    // POST / - Crear tipo de documentación
    router.post(
        '/',
        authenticate,
        verificarPermisoDocumentacionCrear,
        createDocumentacionValidator,
        validateRequest,
        (req, res, next) => controllers.createDocumentacionController.handle(req, res, next)
    );

    // GET /:id - Obtener tipo de documentación por ID
    router.get(
        '/:id',
        authenticate,
        idValidator,
        validateRequest,
        verificarPermisoDocumentacionExistente('DETALLE'),
        (req, res, next) => controllers.getDocumentacionByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar tipo de documentación
    router.put(
        '/:id',
        authenticate,
        idValidator,
        updateDocumentacionValidator,
        validateRequest,
        verificarPermisoDocumentacionExistente('EDITAR'),
        (req, res, next) => controllers.updateDocumentacionController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar tipo de documentación (soft delete)
    router.delete(
        '/:id',
        authenticate,
        idValidator,
        validateRequest,
        verificarPermisoDocumentacionExistente('ELIMINAR'),
        (req, res, next) => controllers.deleteDocumentacionController.handle(req, res, next)
    );

    return router;
}
