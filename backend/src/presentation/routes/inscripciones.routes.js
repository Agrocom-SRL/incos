import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import {
  createEnrollmentValidator,
  updateEnrollmentValidator,
  updateEnrollmentPriorHistoryValidator,
} from '../validators/inscripciones/index.js';

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

    const listarInscripciones = [authenticate, verificarPermiso('matricula.inscribir', 'LISTAR')];
    const detalleInscripcion = [authenticate, verificarPermiso('matricula.inscribir', 'DETALLE')];
    const crearInscripcion = [authenticate, verificarPermiso('matricula.inscribir', 'CREAR')];
    const editarInscripcion = [authenticate, verificarPermiso('matricula.inscripcion.editar', 'EDITAR')];
    const eliminarInscripcion = [authenticate, verificarPermiso('matricula.inscripcion.editar', 'ELIMINAR')];
    const documentoPdf = [authenticate, verificarPermiso('matricula.documento.ver', 'GENERAR_PDF')];

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
        ...listarInscripciones,
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
        ...crearInscripcion,
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
        ...documentoPdf,
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
        ...detalleInscripcion,
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
        ...eliminarInscripcion,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteEnrollmentController.handle(req, res, next)
    );

    /**
     * PUT /api/v1/inscripciones/:id/historial-previo
     * Reemplaza historial_previo (notas de materias concluidas al inscribir)
     */
    router.put(
        '/:id/historial-previo',
        ...editarInscripcion,
        updateEnrollmentPriorHistoryValidator,
        validateRequest,
        (req, res, next) => controllers.updateEnrollmentPriorHistoryController.handle(req, res, next)
    );

    /**
     * PATCH /api/v1/inscripciones/:id/activar-cursado
     * Activa el cursado de la inscripción: sus matrículas pasan INSCRITO → CURSANDO
     * y se abren sus bimestres. Idempotente.
     */
    router.patch(
        '/:id/activar-cursado',
        ...editarInscripcion,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.activarCursadoMatriculaController.handle(req, res, next)
    );

    /**
     * PUT /api/v1/inscripciones/:id
     * Actualizar inscripción (observaciones, fecha; TODO: paralelo/materias)
     */
    router.put(
        '/:id',
        ...editarInscripcion,
        idValidator,
        updateEnrollmentValidator,
        validateRequest,
        (req, res, next) => controllers.updateEnrollmentController.handle(req, res, next)
    );

    return router;
}
