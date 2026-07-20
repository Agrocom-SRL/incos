import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listCursosCapacitacionValidator,
    listHorariosDisponiblesCapacitacionValidator,
    createCursoCapacitacionValidator,
    updateCursoCapacitacionValidator,
    setEstadoCatalogoValidator,
} from '../validators/capacitacion/index.js';

/**
 * Construye el router de Cursos de Capacitación (módulo CAP).
 *
 * Dominio CAPACITACION: cursos cortos abiertos a público externo,
 * independiente de la cadena formal paralelos_gestion → oferta_cursos.
 * Permiso `capacitacion.curso` con vocabulario de acciones v2.
 *
 * Responsabilidades:
 * - Definir rutas y métodos HTTP
 * - Vincular validators y middlewares (RBAC por acción)
 * - Delegar lógica a controllers inyectados
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 */
export function buildCursosCapacitacionRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listar = [authenticate, verificarPermiso('capacitacion.curso', 'LISTAR')];
    const detalle = [authenticate, verificarPermiso('capacitacion.curso', 'DETALLE')];
    const crear = [authenticate, verificarPermiso('capacitacion.curso', 'CREAR')];
    const editar = [authenticate, verificarPermiso('capacitacion.curso', 'EDITAR')];
    const eliminar = [authenticate, verificarPermiso('capacitacion.curso', 'ELIMINAR')];
    const activar = [authenticate, verificarPermiso('capacitacion.curso', 'ACTIVAR')];

    /**
     * GET /api/v1/cursos-capacitacion
     * Listado desde la vista 155 (agregados de inscritos y horarios).
     * Query: page/limit/search + estado + incluirInactivos.
     */
    router.get(
        '/',
        ...listar,
        listCursosCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.listCursosCapacitacionController.handle(req, res, next)
    );

    // POST / - Crear curso (+ horarioIds para la junction capacitacion_horarios)
    router.post(
        '/',
        ...crear,
        createCursoCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.createCursoCapacitacionController.handle(req, res, next)
    );

    /**
     * GET /api/v1/cursos-capacitacion/horarios-disponibles?aulaId=X&excludeCursoId=Y
     * Bloques `horarios` (tipo_horario='CLASES') con flag `ocupado` por aula
     * (choque con paralelos académicos u otros cursos de capacitación).
     * Ruta estática: va ANTES de GET /:id para no chocar con el parámetro.
     */
    router.get(
        '/horarios-disponibles',
        ...listar,
        listHorariosDisponiblesCapacitacionValidator,
        validateRequest,
        (req, res, next) =>
            controllers.listHorariosDisponiblesCapacitacionController.handle(req, res, next)
    );

    // GET /:id - Ficha del curso (vista 155 + bloques de la vista 154)
    router.get(
        '/:id',
        ...detalle,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getCursoCapacitacionByIdController.handle(req, res, next)
    );

    // PUT /:id - Actualizar curso; si trae horarioIds REEMPLAZA la junction
    router.put(
        '/:id',
        ...editar,
        idValidator,
        updateCursoCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.updateCursoCapacitacionController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar curso (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...activar,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoCursoCapacitacionController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar curso (soft delete; bloquea con inscritos vigentes)
    router.delete(
        '/:id',
        ...eliminar,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteCursoCapacitacionController.handle(req, res, next)
    );

    return router;
}
