import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { idValidator } from '../validators/common/index.js';
import { uploadComprobanteCapacitacion } from '../middleware/upload.middleware.js';
import {
    listInscripcionesCapacitacionValidator,
    createInscripcionCapacitacionValidator,
    registerPagoCapacitacionValidator,
    anularInscripcionCapacitacionValidator,
    updateRequisitosInscripcionValidator,
    updateInscripcionCapacitacionValidator,
    updatePagoCapacitacionValidator,
    anularPagoCapacitacionValidator,
    pagoIdValidator,
} from '../validators/capacitacion/index.js';

/**
 * Construye el router de Inscripciones de capacitación (módulo CAP).
 *
 * Recurso `capacitacion_inscritos` (participante ↔ capacitación) + pagos.
 * Permisos:
 * - `capacitacion.inscripcion` (LISTAR/DETALLE/CREAR/ELIMINAR/EDITAR). EDITAR
 *   se reutiliza para "anular" (POST /:id/anular) — no existe acción ANULAR
 *   en el vocabulario cerrado de permiso_acciones/roles_permisos; se evitó
 *   reusar ELIMINAR (ya asignado al "retiro" voluntario) para no otorgar esa
 *   capacidad de regalo a quien solo debía poder anular.
 *   También cubre la corrección de la inscripción (PUT /:id), de un pago
 *   (PUT /:id/pagos/:pagoId) y su anulación (POST /:id/pagos/:pagoId/anular): sin
 *   permiso ni acción nuevos.
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
    const editar = [authenticate, verificarPermiso('capacitacion.inscripcion', 'EDITAR')];
    const anular = [authenticate, verificarPermiso('capacitacion.inscripcion', 'EDITAR')];
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

    // PUT /:id - Corregir la inscripción: datos del participante y/o grupo/horario
    router.put(
        '/:id',
        ...editar,
        idValidator,
        updateInscripcionCapacitacionValidator,
        validateRequest,
        (req, res, next) =>
            controllers.updateInscripcionCapacitacionController.handle(req, res, next)
    );

    // PUT /:id/requisitos - Checklist de requisitos entregados (recalcula el estado)
    router.put(
        '/:id/requisitos',
        ...editar,
        idValidator,
        updateRequisitosInscripcionValidator,
        validateRequest,
        (req, res, next) =>
            controllers.updateRequisitosInscripcionController.handle(req, res, next)
    );

    // POST /:id/pagos - Registrar pago (permiso capacitacion.pago CREAR).
    // JSON o multipart con comprobante opcional (campo `comprobante`, imagen/PDF).
    router.post(
        '/:id/pagos',
        ...registrarPago,
        idValidator,
        uploadComprobanteCapacitacion,
        registerPagoCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.registerPagoCapacitacionController.handle(req, res, next)
    );

    // PUT /:id/pagos/:pagoId - Corregir un pago registrado (recalcula estados)
    router.put(
        '/:id/pagos/:pagoId',
        ...editar,
        idValidator,
        pagoIdValidator,
        updatePagoCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.updatePagoCapacitacionController.handle(req, res, next)
    );

    // POST /:id/pagos/:pagoId/anular - Anular un pago equivocado (motivo obligatorio, conserva historial)
    router.post(
        '/:id/pagos/:pagoId/anular',
        ...editar,
        idValidator,
        pagoIdValidator,
        anularPagoCapacitacionValidator,
        validateRequest,
        (req, res, next) => controllers.anularPagoCapacitacionController.handle(req, res, next)
    );

    // POST /:id/pagos/:pagoId/comprobante - Adjuntar o reemplazar el comprobante de un pago
    router.post(
        '/:id/pagos/:pagoId/comprobante',
        ...registrarPago,
        idValidator,
        pagoIdValidator,
        validateRequest,
        uploadComprobanteCapacitacion,
        (req, res, next) =>
            controllers.adjuntarComprobantePagoCapacitacionController.handle(req, res, next)
    );

    // GET /:id/pagos/:pagoId/comprobante - Descarga autenticada del comprobante
    router.get(
        '/:id/pagos/:pagoId/comprobante',
        ...detalle,
        idValidator,
        pagoIdValidator,
        validateRequest,
        (req, res, next) =>
            controllers.descargarComprobantePagoCapacitacionController.handle(req, res, next)
    );

    // GET /:id/formulario-pdf - Formulario de Inscripción en PDF (permiso DETALLE)
    router.get(
        '/:id/formulario-pdf',
        ...detalle,
        idValidator,
        validateRequest,
        (req, res, next) =>
            controllers.exportFormularioInscripcionCapacitacionController.handle(req, res, next)
    );

    // GET /:id/pagos/:pagoId/recibo-pdf - Recibo de Pago en PDF (permiso DETALLE)
    router.get(
        '/:id/pagos/:pagoId/recibo-pdf',
        ...detalle,
        idValidator,
        pagoIdValidator,
        validateRequest,
        (req, res, next) =>
            controllers.exportReciboPagoCapacitacionController.handle(req, res, next)
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

    // POST /:id/anular - Decisión administrativa manual (nunca automática); el pago
    // ya registrado no se toca (sin reembolso). Solo desde PENDIENTE o INSCRITO.
    router.post(
        '/:id/anular',
        ...anular,
        idValidator,
        anularInscripcionCapacitacionValidator,
        validateRequest,
        (req, res, next) =>
            controllers.anularInscripcionCapacitacionController.handle(req, res, next)
    );

    return router;
}
