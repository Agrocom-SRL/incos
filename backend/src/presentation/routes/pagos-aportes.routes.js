import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import {
    registerPagoAporteValidator,
    updatePaymentCuotaValidator,
    searchStudentsRegistroAporteValidator,
} from '../validators/pagos/index.js';
import { uploadPaymentDocument } from '../middleware/upload.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';

/**
 * Construye el router del recurso Pagos de Aportes Académicos
 *
 * Modelo de datos: cabecera (pago_aporte) + cuotas (pago_cuotas).
 * - Cabecera: una por (estudiante, gestión); montos y estado.
 * - Cuota: cada abono es un registro en pago_cuotas con numero_recibo, fecha_pago, monto, etc.
 *
 * Contrato de :id en rutas:
 * - GET /:id → id = cabecera id (pago_aporte). Retorna cabecera + cuotas.
 * - DELETE /:id → id = cabecera id (pago_aporte). Elimina cabecera y todas sus cuotas.
 * - DELETE /cuotas/:id → id = cuota (pago_cuotas). Elimina un solo abono y recalcula estado.
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

    /** Listado: Finanzas o Matrícula (aportes). */
    const pagoListar = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.ver', 'LISTAR'],
            ['matricula.pago.aporte.ver', 'LISTAR'],
        ]),
    ];
    /**
     * Estado del aporte para detalle / registro de cuotas (no es listado global).
     * Alineado con quien puede ver detalle, listar o registrar pagos.
     */
    const pagoEstadoRegistro = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.ver', 'LISTAR'],
            ['matricula.pago.aporte.ver', 'LISTAR'],
            ['finanzas.pago.ver', 'DETALLE'],
            ['matricula.pago.aporte.ver', 'DETALLE'],
            ['finanzas.pago.registrar', 'CREAR'],
        ]),
    ];
    /** Detalle de cabecera por id. */
    const pagoDetalle = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.ver', 'DETALLE'],
            ['matricula.pago.aporte.ver', 'DETALLE'],
        ]),
    ];
    const pagoRegistrar = [authenticate, verificarPermiso('finanzas.pago.registrar', 'CREAR')];
    /** Anular cuota: Finanzas o permiso paralelo en Matrícula. */
    const pagoEliminar = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.editar', 'ELIMINAR'],
            ['matricula.pago.aporte.ver', 'ELIMINAR'],
        ]),
    ];
    /** Editar cuota (pago_cuotas): Finanzas o Matrícula (aportes). */
    const pagoEditarCuota = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.editar', 'EDITAR'],
            ['matricula.pago.aporte.ver', 'EDITAR'],
        ]),
    ];
    /** Recibo PDF: EXPORTAR en Finanzas o en matricula.pago.aporte.ver. */
    const pagoExportar = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.ver', 'EXPORTAR'],
            ['matricula.pago.aporte.ver', 'EXPORTAR'],
        ]),
    ];

    // ---- Compromiso de pago: lectura con finanzas.pago.ver; mutaciones con finanzas.pago.editar ----
    /** Ver compromiso vigente de una cabecera (lectura). */
    const compromisoVer = [
        authenticate,
        verificarPermisoCualquiera([
            ['finanzas.pago.ver', 'LISTAR'],
            ['finanzas.pago.ver', 'DETALLE'],
            ['matricula.pago.aporte.ver', 'LISTAR'],
            ['matricula.pago.aporte.ver', 'DETALLE'],
        ]),
    ];
    /**
     * Crear/reemplazar compromiso vigente.
     * NOTA RBAC: `finanzas.pago.editar` NO tiene la acción CREAR sembrada (solo
     * EDITAR/ELIMINAR, ver seed 60-seed-permisos-fin.sql). Para no introducir un
     * permiso imposible de satisfacer (y sin crear seeds nuevos, por requisito),
     * el alta/reemplazo del compromiso se autoriza con `finanzas.pago.editar`
     * EDITAR: es una mutación sobre la cabecera de pago ya existente.
     */
    const compromisoCrear = [authenticate, verificarPermiso('finanzas.pago.editar', 'EDITAR')];
    /** Editar compromiso. */
    const compromisoEditar = [authenticate, verificarPermiso('finanzas.pago.editar', 'EDITAR')];
    /** Eliminar (soft delete) compromiso. */
    const compromisoEliminar = [authenticate, verificarPermiso('finanzas.pago.editar', 'ELIMINAR')];

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
        ...pagoListar,
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
        ...pagoEstadoRegistro,
        (req, res, next) => controllers.getEstadoAporteRegistroController.handle(req, res, next)
    );

    /**
     * GET /api/v1/pagos-aportes/buscar-estudiantes-registro
     * Búsqueda de estudiantes (contacto, CI, código, nombres, carrera) para flujo de registro de aporte.
     * Query: q (min 2 salvo con preliminar=1), limit (opcional, 1–100), preliminar=1 (muestra con saldo pendiente).
     */
    router.get(
        '/buscar-estudiantes-registro',
        ...pagoEstadoRegistro,
        searchStudentsRegistroAporteValidator,
        validateRequest,
        (req, res, next) => controllers.searchStudentsForAporteRegistroController.handle(req, res, next)
    );

    /**
     * GET /api/v1/pagos-aportes/export/lista-por-carrera
     * Excel: inscritos por carrera con monto de aporte, descuento, cuotas, saldo, etc.
     * Query: carrera_id (requerido), gestion_id (opcional; gestión vigente por defecto)
     * Permiso: finanzas.pago.ver EXPORTAR o matricula.pago.aporte.ver EXPORTAR (pagoExportar).
     */
    router.get(
        '/export/lista-por-carrera',
        ...pagoExportar,
        (req, res, next) => controllers.exportListaAportesPorCarreraExcelController.handle(req, res, next)
    );

    /** Planilla de control de becas por carrera (solo lectura). */
    const reporteBecasCarrera = [
        authenticate,
        verificarPermiso('finanzas.pago.reporte.carrera', 'LISTAR'),
    ];

    /**
     * GET /api/v1/pagos-aportes/reportes/becas-por-carrera
     * Planilla de control de Becas por carrera (totales, distribución, resumen).
     * Query: gestion_id (opcional; gestión vigente por defecto).
     * Permiso: finanzas.pago.reporte.carrera LISTAR.
     * DECLARADA antes de /:id para evitar colisión de rutas.
     */
    router.get(
        '/reportes/becas-por-carrera',
        ...reporteBecasCarrera,
        (req, res, next) => controllers.getBecasPorCarreraReporteController.handle(req, res, next)
    );

    /** Planilla de control de Cuentas por cobrar (solo lectura). */
    const reporteCuentasPorCobrar = [
        authenticate,
        verificarPermiso('finanzas.pago.reporte.carrera', 'LISTAR'),
    ];

    /**
     * GET /api/v1/pagos-aportes/reportes/cuentas-por-cobrar
     * Planilla de control de Cuentas por cobrar (CARRERA → PARALELO → ESTUDIANTES, totales).
     * Query: gestion_id (opcional; gestión vigente por defecto).
     * Permiso: finanzas.pago.reporte.carrera LISTAR.
     * DECLARADA antes de /:id para evitar colisión de rutas.
     */
    router.get(
        '/reportes/cuentas-por-cobrar',
        ...reporteCuentasPorCobrar,
        (req, res, next) => controllers.getCuentasPorCobrarReporteController.handle(req, res, next)
    );

    // ============================================
    // COMPROMISO DE PAGO (CRUD)
    // ============================================

    /**
     * PUT /api/v1/pagos-aportes/compromiso/:id
     * Editar un compromiso de pago (id = compromisos_pago.id).
     * DECLARADA antes de /:id para evitar colisión.
     */
    router.put(
        '/compromiso/:id',
        ...compromisoEditar,
        ...idValidator,
        validateRequest,
        (req, res, next) => controllers.updateCompromisoController.handle(req, res, next)
    );

    /**
     * DELETE /api/v1/pagos-aportes/compromiso/:id
     * Soft delete de un compromiso de pago (id = compromisos_pago.id).
     * DECLARADA antes de /:id para evitar colisión.
     */
    router.delete(
        '/compromiso/:id',
        ...compromisoEliminar,
        ...idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteCompromisoController.handle(req, res, next)
    );

    /**
     * GET /api/v1/pagos-aportes/:pagoAporteId/compromiso
     * Compromiso VIGENTE de la cabecera (o null).
     */
    router.get(
        '/:pagoAporteId/compromiso',
        ...compromisoVer,
        (req, res, next) => controllers.getCompromisoController.handle(req, res, next)
    );

    /**
     * POST /api/v1/pagos-aportes/:pagoAporteId/compromiso
     * Crea/reemplaza el compromiso VIGENTE de la cabecera.
     * Body: fecha_compromiso (req), observacion (opt).
     */
    router.post(
        '/:pagoAporteId/compromiso',
        ...compromisoCrear,
        (req, res, next) => controllers.upsertCompromisoController.handle(req, res, next)
    );

    // ============================================
    // REGISTRO DE CUOTA (ABONO)
    // ============================================

    /**
     * POST /api/v1/pagos-aportes
     * Registrar una cuota (abono). Crea/actualiza cabecera si hace falta e inserta en pago_cuotas.
     * Body (multipart/form-data): student_id, management_id, amount, payment_method_id, payment_account_id, payment_date, transaction_number, codigo_comprobante, descripcion, documentoRespaldo (archivo)
     */
    /**
     * PUT /api/v1/pagos-aportes/cuotas/:id
     * Actualizar una cuota existente (id = pago_cuotas.id). Recalcula estado de la cabecera.
     */
    router.put(
        '/cuotas/:id',
        ...pagoEditarCuota,
        updatePaymentCuotaValidator,
        validateRequest,
        (req, res, next) => controllers.updatePaymentInstallmentController.handle(req, res, next)
    );

    /**
     * DELETE /api/v1/pagos-aportes/cuotas/:id
     * Eliminar una cuota (pago_cuotas.id). Soft delete; recalcula estado de la cabecera.
     */
    router.delete(
        '/cuotas/:id',
        ...pagoEliminar,
        ...idValidator,
        validateRequest,
        (req, res, next) => controllers.deletePaymentInstallmentController.handle(req, res, next)
    );

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
        ...pagoDetalle,
        (req, res, next) => controllers.getPaymentAporteByIdController.handle(req, res, next)
    );

    /**
     * DELETE /api/v1/pagos-aportes/:id
     * Eliminar la cabecera de aporte y todas sus cuotas. :id = pago_aporte.id.
     */
    router.delete(
        '/:id',
        ...pagoEliminar,
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
        ...pagoExportar,
        (req, res, next) => controllers.generateReciboPagoController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO)
    // ============================================
    // GET /:id/cuotas - Listar cuotas de una cabecera (id = cabecera id)

    return router;
}