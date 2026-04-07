import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { listParalelosValidator } from '../validators/academico/index.js';
import { idValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Paralelos (Académico)
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
 * const router = buildParalelosRouter({ controllers, middlewares });
 * app.use('/api/v1/paralelos', router);
 */
export function buildParalelosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listarParalelos = [
        authenticate,
        verificarPermisoCualquiera([
            ['institucional.config.academico.cursos', 'VER'],
            ['matricula.admision.ver', 'VER'],
            ['matricula.inscribir', 'CREAR'],
        ]),
    ];
    const verHorarioParalelo = [
        authenticate,
        verificarPermisoCualquiera([
            ['institucional.gestion.actual', 'VER'],
            ['academico.calificacion.curso', 'VER'],
            ['academico.calificacion.curso', 'EDITAR'],
        ]),
    ];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/paralelos
     * Listar paralelos con filtros y paginación
     * 
     * Query params:
     * - page: número de página (paginación)
     * - limit: cantidad por página (paginación)
     * - search: término de búsqueda general (nombre, descripción)
     * - periodo: filtro por número de periodo (1, 2, 3...) - devuelve paralelos de todas las carreras (opcional, debe ser entero > 0)
     * - periodo_id: filtro por ID único del periodo (opcional, debe ser entero > 0)
     * - carrera_id: filtro por ID de carrera (opcional, debe ser entero > 0)
     */
    router.get(
        '/',
        ...listarParalelos,
        listParalelosValidator,
        validateRequest,
        (req, res, next) => controllers.listParalelosController.handle(req, res, next)
    );

    /**
     * GET /api/v1/paralelos/:id/schedule
     * Obtener horarios completos de un paralelo
     * 
     * Path params:
     * - id: ID del paralelo (debe ser entero > 0)
     * 
     * Retorna:
     * - Información del paralelo
     * - Lista de cursos con sus horarios, aulas y materias
     */
    router.get(
        '/:id/schedule',
        ...verHorarioParalelo,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getParaleloScheduleController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // POST / - Crear paralelo
    // router.post(
    //     '/',
    //     createParaleloValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createParaleloController.handle(req, res, next)
    // );

    // GET /:id - Obtener paralelo por ID
    // router.get(
    //     '/:id',
    //     getParaleloByIdValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getParaleloByIdController.handle(req, res, next)
    // );

    // PUT /:id - Actualizar paralelo
    // router.put(
    //     '/:id',
    //     updateParaleloValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateParaleloController.handle(req, res, next)
    // );

    // DELETE /:id - Eliminar paralelo (soft delete)
    // router.delete(
    //     '/:id',
    //     (req, res, next) => controllers.deleteParaleloController.handle(req, res, next)
    // );

    return router;
}
