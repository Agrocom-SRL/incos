import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import {
    listInscripcionesCapacitacionValidator,
    createInscripcionCapacitacionValidator,
    registerPagoCapacitacionValidator,
} from '../validators/capacitacion/index.js';

/**
 * Construye el router de Inscripciones de capacitación (módulo CAP).
 *
 * Recurso `capacitacion_inscritos` (participante ↔ capacitación) + pagos.
 * Permisos:
 * - `capacitacion.inscripcion` (LISTAR/DETALLE/CREAR/ELIMINAR)
 * - `capacitacion.pago` CREAR para POST /:id/pagos (mismo grupo UI
 *   cap_inscripciones, permiso separado para poder dar caja sin alta).
 *
 * Contrato de :id: siempre el id de la INSCRIPCIÓN (capacitacion_inscritos).
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 */
export function buildInscripcionesCapacitacionRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const listar = [authenticate, verificarPermiso('capacitacion.inscripcion', 'LISTAR')];
    const detalle = [authenticate, verificarPermiso('capacitacion.inscripcion', 'DETALLE')];
    const crear = [authenticate, verificarPermiso('capacitacion.inscripcion', 'CREAR')];
    const eliminar = [authenticate, verificarPermiso('capacitacion.inscripcion', 'ELIMINAR')];
    const registrarPago = [authenticate, verificarPermiso('capacitacion.pago', 'CREAR')];

    /**
     * GET /api/v1/inscripciones-capacitacion
     * Listado con participante + curso + estado de pago (total pagado vs costo).
     * Query: page/limit/search + capacitacionId + participanteId + estado +
     * incluirInactivos.
     */
    router.get(
        '/',
        ...listar,
        listInscripcionesCapacitacionValidator,
        validateRequest,
        (req, res, next) =>
            controllers.listInscripcionesCapacitacionController.handle(req, res, next)
    );

    /**
     * POST /api/v1/inscripciones-capacitacion
     * Inscribe participante NUEVO (objeto participante) o EXISTENTE
     * (participanteId) + pago inicial opcional, en UNA transacción.
     * El cupo del curso es informativo (no bloquea, decisión §6.9).
     */
    router.post(
        '/',
        ...crear,
        createInscripcionCapacitacionValidator,
        validateRequest,
        (req, res, next) =>
            controllers.createInscripcionCapacitacionController.handle(req, res, next)
    );

    // GET /:id - Ficha de la inscripción (participante + curso + historial de pagos)
    router.get(
        '/:id',
        ...detalle,
        idValidator,
        validateRequest,
        (req, res, next) =>
            controllers.getInscripcionCapacitacionByIdController.handle(req, res, next)
    );

    // POST /:id/pagos - Registrar pago (permiso capacitacion.pago CREAR)
    router.post(
        '/:id/pagos',
        ...registrarPago,
        idValidator,
        registerPagoCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.registerPagoCapacitacionController.handle(req, res, next)
    );

    // DELETE /:id - Eliminar inscripción (soft delete + pagos en cascada, queda RETIRADO)
    router.delete(
        '/:id',
        ...eliminar,
        idValidator,
        validateRequest,
        (req, res, next) =>
            controllers.deleteInscripcionCapacitacionController.handle(req, res, next)
    );

    return router;
}
