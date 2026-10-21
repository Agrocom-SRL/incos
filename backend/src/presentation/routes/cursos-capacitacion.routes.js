import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listCursosCapacitacionValidator,
    listHorariosDisponiblesCapacitacionValidator,
    listHorariosCapacitacionValidator,
    listGruposCapacitacionValidator,
    createHorarioCapacitacionValidator,
    updateHorarioCapacitacionValidator,
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
    const horarioListar = [
        authenticate,
        // El formulario de curso necesita el catálogo para su selector de horarios
        verificarPermisoCualquiera([
            ['capacitacion.grupo', 'LISTAR'],
            ['capacitacion.curso', 'CREAR'],
            ['capacitacion.curso', 'EDITAR'],
        ]),
    ];
    const grupoListar = [authenticate, verificarPermiso('capacitacion.grupo', 'LISTAR')];
    const horarioDetalle = [authenticate, verificarPermiso('capacitacion.grupo', 'DETALLE')];
    const horarioCrear = [authenticate, verificarPermiso('capacitacion.grupo', 'CREAR')];
    const horarioEditar = [authenticate, verificarPermiso('capacitacion.grupo', 'EDITAR')];
    const horarioEliminar = [authenticate, verificarPermiso('capacitacion.grupo', 'ELIMINAR')];
    const exportarInscritos = [authenticate, verificarPermiso('capacitacion.inscripcion', 'EXPORTAR')];

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

    // POST / - Crear curso (+ grupos con sus horarios y requisitos)
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

    /**
     * GET /api/v1/cursos-capacitacion/grupos
     * Grupos de TODAS las capacitaciones (curso, aula, cupo, inscritos y
     * horarios) desde la vista 190. Estática: ANTES de GET /:id.
     * Query: page/limit/search + cursoId + estado.
     */
    router.get(
        '/grupos',
        ...grupoListar,
        listGruposCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.listGruposCapacitacionController.handle(req, res, next)
    );

    /**
     * CRUD de horarios de capacitación (tipo_horario='CAPACITACION'), permiso
     * `capacitacion.grupo`. Estáticas: ANTES de GET /:id.
     * GET /horarios[?aulaId&excludeCursoId&search&sort] incluye `cursosEnUso`;
     * `ocupado` solo se calcula con aulaId.
     */
    router.get(
        '/horarios',
        ...horarioListar,
        listHorariosCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.listHorariosCapacitacionController.handle(req, res, next)
    );

    // POST /horarios - Find-or-create de un horario (día + hora inicio/fin)
    router.post(
        '/horarios',
        ...horarioCrear,
        createHorarioCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.createHorarioCapacitacionController.handle(req, res, next)
    );

    // GET /horarios/:id - Ficha del horario con los cursos que lo usan
    router.get(
        '/horarios/:id',
        ...horarioDetalle,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getHorarioCapacitacionController.handle(req, res, next)
    );

    // PUT /horarios/:id - Editar día, horas y nombre (evita duplicado exacto)
    router.put(
        '/horarios/:id',
        ...horarioEditar,
        idValidator,
        updateHorarioCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.updateHorarioCapacitacionController.handle(req, res, next)
    );

    // DELETE /horarios/:id - Soft delete; 409 con detalle si lo usa algún curso activo
    router.delete(
        '/horarios/:id',
        ...horarioEliminar,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteHorarioCapacitacionController.handle(req, res, next)
    );

    // GET /:id - Ficha del curso (vista 155 + bloques de la vista 154)
    router.get(
        '/:id',
        ...detalle,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getCursoCapacitacionByIdController.handle(req, res, next)
    );

    // GET /:id/inscritos/exportar - Excel (.xlsx) del listado de inscritos vigentes del curso
    router.get(
        '/:id/inscritos/exportar',
        ...exportarInscritos,
        idValidator,
        validateRequest,
        (req, res, next) =>
            controllers.exportListadoInscritosCapacitacionController.handle(req, res, next)
    );

    // POST /:id/abrir - Transición manual PROPUESTO → ABIERTO (abrir inscripciones)
    router.post(
        '/:id/abrir',
        ...editar,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.abrirCursoCapacitacionController.handle(req, res, next)
    );

    // POST /:id/cancelar - Transición manual hacia CANCELADO (desde PROPUESTO o ABIERTO)
    router.post(
        '/:id/cancelar',
        ...editar,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.cancelarCursoCapacitacionController.handle(req, res, next)
    );

    // PUT /:id - Actualizar curso; si trae grupos/requisitos los SINCRONIZA
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
