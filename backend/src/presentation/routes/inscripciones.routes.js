import express from 'express';

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
     * Query: page, limit, search
     * TODO: Implementar cuando se cree el Use Case y Controller
     */
    // router.get(
    //     '/',
    //     listValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.listEnrollmentsController.handle(req, res, next)
    // );

    /**
     * POST /api/v1/inscripciones
     * Registrar nueva inscripción
     * Body: enrollment data
     * TODO: Implementar cuando se cree el Use Case y Controller
     */
    // router.post(
    //     '/',
    //     createEnrollmentValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.createEnrollmentController.handle(req, res, next)
    // );

    /**
     * GET /api/v1/inscripciones/:id
     * Obtener inscripción por ID
     * Path: id
     * TODO: Implementar cuando se cree el Use Case y Controller
     */
    // router.get(
    //     '/:id',
    //     idValidator,
    //     validateRequest,
    //     (req, res, next) => controllers.getEnrollmentByIdController.handle(req, res, next)
    // );

    // ============================================
    // RUTA TEMPORAL - Para verificar que funciona
    // ============================================
    router.get('/', (req, res) => {
        res.json({
            message: 'Módulo de Inscripciones - En desarrollo',
            endpoints: {
                list: 'GET /api/v1/inscripciones',
                create: 'POST /api/v1/inscripciones',
                getById: 'GET /api/v1/inscripciones/:id',
            },
        });
    });

    return router;
}
