import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import { listTiposEvaluacionValidator } from '../validators/academico/list-tipos-evaluacion.validator.js';
import {
    createTipoEvaluacionValidator,
    updateTipoEvaluacionValidator,
} from '../validators/configuracion/tipos-evaluacion.validator.js';
import { setEstadoCatalogoValidator } from '../validators/configuracion/set-estado.validator.js';

/**
 * Construye el router de administración del catálogo Tipos de Evaluación (CFG).
 *
 * Distinto de `GET /api/v1/calificaciones/tipos-evaluacion` (combo de solo
 * lectura del cuaderno de calificaciones, permiso `sistema.catalogo.referencia`
 * + `complementoCalificacionesLectura` — ver calificaciones.routes.js, NO se
 * toca). Este router es el CRUD completo de administración del catálogo
 * maestro, permiso propio `configuracion.tipo-evaluacion`.
 *
 * El listado (GET /) reutiliza el mismo `ListTiposEvaluacionUseCase`/Controller
 * ya registrado para el cuaderno (misma consulta, sin duplicar agregación),
 * solo cambia el permiso que gatea la ruta.
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 *
 * @example
 * const router = buildTiposEvaluacionRouter({ controllers, middlewares });
 * app.use('/api/v1/tipos-evaluacion', router);
 */
export function buildTiposEvaluacionRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarTiposEvaluacion = [authenticate, verificarPermiso('configuracion.tipo-evaluacion', 'LISTAR')];
    const detalleTiposEvaluacion = [authenticate, verificarPermiso('configuracion.tipo-evaluacion', 'DETALLE')];
    const crearTiposEvaluacion = [authenticate, verificarPermiso('configuracion.tipo-evaluacion', 'CREAR')];
    const editarTiposEvaluacion = [authenticate, verificarPermiso('configuracion.tipo-evaluacion', 'EDITAR')];
    const eliminarTiposEvaluacion = [authenticate, verificarPermiso('configuracion.tipo-evaluacion', 'ELIMINAR')];
    const activarTiposEvaluacion = [authenticate, verificarPermiso('configuracion.tipo-evaluacion', 'ACTIVAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/tipos-evaluacion
     * Listar todos los tipos de evaluación con filtros y paginación
     * (mismo use case que el combo del cuaderno, permiso de administración).
     */
    router.get(
        '/',
        ...listarTiposEvaluacion,
        listTiposEvaluacionValidator,
        validateRequest,
        (req, res, next) => controllers.listTiposEvaluacionController.handle(req, res, next)
    );

    // POST / - Crear tipo de evaluación
    router.post(
        '/',
        ...crearTiposEvaluacion,
        createTipoEvaluacionValidator,
        validateRequest,
        (req, res, next) => controllers.createTipoEvaluacionController.handle(req, res, next)
    );

    // GET /:id - Obtener tipo de evaluación por ID
    router.get(
        '/:id',
        ...detalleTiposEvaluacion,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getTipoEvaluacionByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar tipo de evaluación
    router.put(
        '/:id',
        ...editarTiposEvaluacion,
        idValidator,
        updateTipoEvaluacionValidator,
        validateRequest,
        (req, res, next) => controllers.updateTipoEvaluacionController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar tipo de evaluación (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activarTiposEvaluacion,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoTipoEvaluacionController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar tipo de evaluación (soft delete)
    router.delete(
        '/:id',
        ...eliminarTiposEvaluacion,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteTipoEvaluacionController.handle(req, res, next)
    );

    return router;
}
