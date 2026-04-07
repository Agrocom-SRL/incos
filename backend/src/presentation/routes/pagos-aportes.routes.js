import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { registerPagoAporteValidator } from '../validators/pagos/index.js';
import { uploadPaymentDocument } from '../middleware/upload.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del recurso Pagos de Aportes Académicos
 *
 * Modelo de datos: cabecera (pago_aporte) + cuotas (pago_cuotas).
 * - Cabecera: una por (estudiante, gestión); montos y estado.
 * - Cuota: cada abono es un registro en pago_cuotas con numero_recibo, fecha_pago, monto, etc.
 *
 * Contrato de :id en rutas:
 * - GET /:id → id = cabecera id (pago_aporte). Retorna cabecera + cuotas.
 * - DELETE /:id → id = cuota id (pago_cuotas). Elimina un abono.
 * - GET /:id/recibo → id = cuota id (pago_cuotas). Genera recibo de esa cuota.
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 */
export function buildPagosAportesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    const pagoVer = [authenticate, verificarPermiso('finanzas.pago.ver', 'VER')];
    const pagoRegistrar = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.registrar', 'CREAR'],
            ['matricula.pago.aporte.ver', 'VER'],
        ]),
    ];
    const pagoEditar = [authenticate, verificarPermiso('finanzas.pago.editar', 'EDITAR')];

    // ============================================
    // LISTADO DE CABECERAS DE APORTE
    // ============================================

    /**
     * GET /api/v1/pagos-aportes
     * Listar cabeceras de aporte (una por estudiante-gestión) con filtros y paginación
     * Query: page, limit, search, sort
     */
    router.get(
        '/',
        ...pagoVer,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listPagosAportesController.handle(req, res, next)
    );

    /**
     * GET /api/v1/pagos-aportes/estado-registro
     * Estado actual del aporte de un estudiante para el formulario de registro de pago.
     * Query: estudiante_id (requerido), gestion_id (opcional; si no se envía, gestión vigente).
     */
    router.get(
        '/estado-registro',
        ...pagoVer,
        (req, res, next) => controllers.getEstadoAporteRegistroController.handle(req, res, next)
    );

    // ============================================
    // REGISTRO DE CUOTA (ABONO)
    // ============================================

    /**
     * POST /api/v1/pagos-aportes
     * Registrar una cuota (abono). Crea/actualiza cabecera si hace falta e inserta en pago_cuotas.
     * Body (multipart/form-data): student_id, management_id, amount, payment_method_id, payment_account_id, payment_date, transaction_number, codigo_comprobante, descripcion, documentoRespaldo (archivo)
     */
    router.post(
        '/',
        ...pagoRegistrar,
        // Wrapper para manejar errores de multer
        (req, res, next) => {
            uploadPaymentDocument(req, res, (err) => {
                if (err) {
                    // Error de multer (tipo de archivo, tamaño, etc.)
                    return next(err);
                }
                // Si no hay error, continuar al siguiente middleware
                next();
            });
        },
        registerPagoAporteValidator,   // 1. Validator
        validateRequest,               // 2. Middleware que procesa errores
        (req, res, next) => controllers.registerPagoAporteController.handle(req, res, next)  // 3. Controller
    );

    // ============================================
    // DETALLE DE CABECERA DE APORTE
    // ============================================

    /**
     * GET /api/v1/pagos-aportes/:id
     * Detalle de cabecera de aporte por id. :id = cabecera id (pago_aporte).
     * El caso de uso retorna cabecera + sus cuotas.
     */
    router.get(
        '/:id',
        ...pagoVer,
        (req, res, next) => controllers.getPaymentAporteByIdController.handle(req, res, next)
    );

    /**
     * DELETE /api/v1/pagos-aportes/:id
     * Eliminar una cuota (abono) por id. :id = cuota id (pago_cuotas).
     * Soft delete de la cuota; el caso de uso actualiza estado de la cabecera si aplica.
     */
    router.delete(
        '/:id',
        ...pagoEditar,
        (req, res, next) => controllers.deletePaymentAporteController.handle(req, res, next)
    );

    // ============================================
    // GENERACIÓN DE RECIBO DE CUOTA
    // ============================================

    /**
     * GET /api/v1/pagos-aportes/:id/recibo
     * Generar u obtener el recibo de una cuota. :id = cuota id (pago_cuotas).
     */
    router.get(
        '/:id/recibo',
        ...pagoVer,
        (req, res, next) => controllers.generateReciboPagoController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO)
    // ============================================
    // GET /:id/cuotas - Listar cuotas de una cabecera (id = cabecera id)

    return router;
}