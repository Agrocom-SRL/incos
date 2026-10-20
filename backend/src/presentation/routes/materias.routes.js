import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator, listValidator } from '../validators/common/index.js';
import { listMateriasValidator } from '../validators/academico/index.js';
import {
    createMateriaValidator,
    updateMateriaValidator,
} from '../validators/configuracion/materias.validator.js';

/**
 * Construye el router del módulo Materias
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
 * const router = buildMateriasRouter({ controllers, middlewares });
 * app.use('/api/v1/materias', router);
 */
export function buildMateriasRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarMaterias = [authenticate, verificarPermiso('configuracion.materia', 'LISTAR')];
    const detalleMaterias = [authenticate, verificarPermiso('configuracion.materia', 'DETALLE')];
    const crearMaterias = [authenticate, verificarPermiso('configuracion.materia', 'CREAR')];
    const editarMaterias = [authenticate, verificarPermiso('configuracion.materia', 'EDITAR')];
    const eliminarMaterias = [authenticate, verificarPermiso('configuracion.materia', 'ELIMINAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/materias
     * Listar todas las materias con filtros y paginación
     *
     * Query params según IBaseRepository.obtenerTodos:
     * - pagina: número de página (paginación)
     * - limite: cantidad por página (paginación)
     * - busqueda: término de búsqueda general
     * - periodo_id: filtro por ID de periodo (opcional)
     * - incluirInactivos: incluir registros inactivos (activo = false)
     */
    router.get(
        '/',
        ...listarMaterias,
        listMateriasValidator,
        validateRequest,
        (req, res, next) => controllers.listMateriasController.handle(req, res, next)
    );

    router.post(
        '/',
        ...crearMaterias,
        createMateriaValidator,
        validateRequest,
        (req, res, next) => controllers.createMateriaController.handle(req, res, next)
    );

    router.get(
        '/:id',
        ...detalleMaterias,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getMateriaByIdController.handle(req, res, next)
    );

    router.put(
        '/:id',
        ...editarMaterias,
        idValidator,
        updateMateriaValidator,
        validateRequest,
        (req, res, next) => controllers.updateMateriaController.handle(req, res, next)
    );

    router.delete(
        '/:id',
        ...eliminarMaterias,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteMateriaController.handle(req, res, next)
    );

    return router;
}
