import express from 'express';
import { listValidator, idValidator } from '../validators/common/index.js';
import { createEnrollmentValidator } from '../validators/inscripciones/index.js';

/**
 * Construye el router del módulo Inscripciones
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
 * const router = buildInscripcionesRouter({ controllers, middlewares });
 * app.use('/api/v1/inscripciones', router);
 */
export function buildInscripcionesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/inscripciones
     * Listar inscripciones con filtros y paginación
     * Query: page, limit, search, sort
     */
    router.get(
        '/',
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listEnrollmentsController.handle(req, res, next)
    );

    /**
     * POST /api/v1/inscripciones
     * Registrar nueva inscripción
     * Body: studentId, parallelId, enrollmentType (opcional), enrollmentDate (opcional), observations (opcional)
     * El Use Case recupera todos los datos necesarios desde estos IDs y crea los registros en las tablas correspondientes
     */
    router.post(
        '/',
        createEnrollmentValidator, // 1. Validator primero
        validateRequest,            // 2. Middleware que procesa errores
        (req, res, next) => controllers.createEnrollmentController.handle(req, res, next)  // 3. Controller al final
    );

    /**
     * POST /api/v1/inscripciones/:id/generar-formulario
     * Generar formulario de inscripción (PDF) para un estudiante
     * Path: id (ID del estudiante)
     */
    router.post(
        '/:id/generar-formulario',
        idValidator,
        validateRequest,
        (req, res, next) => controllers.generateFormularioInscripcionController.handle(req, res, next)
    );

    /**
     * GET /api/v1/inscripciones/:id
     * Obtener inscripción por ID con materias relacionadas
     * Path: id
     */
    router.get(
        '/:id',
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getEnrollmentByIdController.handle(req, res, next)
    );

    /**
     * DELETE /api/v1/inscripciones/:id
     * Eliminar inscripción (soft delete)
     * Path: id
     * Elimina la inscripción y todas sus relaciones (materias inscritas, boletas, etc.)
     */
    router.delete(
        '/:id',
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteEnrollmentController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO: Implementar cuando se necesiten)
    // ============================================

    // PUT /:id - Actualizar inscripción
    // router.put(
    //     '/:id',
    //     updateEnrollmentValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.updateEnrollmentController.handle(req, res, next)
    // );

    return router;
}
