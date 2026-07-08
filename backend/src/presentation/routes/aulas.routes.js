import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listAulasValidator,
    createAulaValidator,
    updateAulaValidator,
} from '../validators/configuracion/aulas.validator.js';
import { setEstadoCatalogoValidator } from '../validators/configuracion/set-estado.validator.js';

/**
 * Construye el router de administración del catálogo Aulas (CFG).
 *
 * Distinto de `aulas-horarios.routes.js` (GET /catalogo, solo lectura para el
 * picker de oferta académica, permiso `institucional.oferta.paralelo-gestion`).
 * Este router es el CRUD completo de administración del catálogo maestro,
 * permiso propio `configuracion.aula`. Ambos se montan en `/api/v1/aulas`
 * (rutas sin colisión: `/catalogo` vs `/`, `/:id`).
 *
 * Responsabilidades:
 * - Definir rutas y métodos HTTP
 * - Vincular validators y middlewares
 * - Delegar lógica a controllers inyectados
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 *
 * @example
 * const router = buildAulasRouter({ controllers, middlewares });
 * app.use('/api/v1/aulas', router);
 */
export function buildAulasRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarAulas = [authenticate, verificarPermiso('configuracion.aula', 'LISTAR')];
    const detalleAulas = [authenticate, verificarPermiso('configuracion.aula', 'DETALLE')];
    const crearAulas = [authenticate, verificarPermiso('configuracion.aula', 'CREAR')];
    const editarAulas = [authenticate, verificarPermiso('configuracion.aula', 'EDITAR')];
    const eliminarAulas = [authenticate, verificarPermiso('configuracion.aula', 'ELIMINAR')];
    const activarAulas = [authenticate, verificarPermiso('configuracion.aula', 'ACTIVAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/aulas
     * Listar todas las aulas con filtros y paginación
     *
     * Query params:
     * - page/limit/search: paginación y búsqueda genéricas
     * - categoria: filtro por categoría (LABORATORIO, AULA, TALLER, AUDITORIO)
     * - incluirInactivos: incluir registros inactivos (activo = false). El aula
     *   `LAB-2 / Sala de Docentes` (id 2) está desactivada a propósito y solo
     *   se ve pasando este flag, igual que el resto de catálogos de referencia.
     */
    router.get(
        '/',
        ...listarAulas,
        listAulasValidator,
        validateRequest,
        (req, res, next) => controllers.listAulasController.handle(req, res, next)
    );

    // POST / - Crear aula
    router.post(
        '/',
        ...crearAulas,
        createAulaValidator,
        validateRequest,
        (req, res, next) => controllers.createAulaController.handle(req, res, next)
    );

    // GET /:id - Obtener aula por ID
    router.get(
        '/:id',
        ...detalleAulas,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getAulaByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar aula
    router.put(
        '/:id',
        ...editarAulas,
        idValidator,
        updateAulaValidator,
        validateRequest,
        (req, res, next) => controllers.updateAulaController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar aula (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activarAulas,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoAulaController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar aula (soft delete)
    router.delete(
        '/:id',
        ...eliminarAulas,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteAulaController.handle(req, res, next)
    );

    return router;
}
