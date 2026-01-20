import express from 'express';
import { registerPagoAporteValidator } from '../validators/pagos/index.js';
import { uploadPaymentDocument } from '../middleware/upload.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del recurso Pagos de Aportes Académicos
 * 
 * Responsabilidades:
 * - Definir rutas y métodos HTTP
 * - Vincular validators y middlewares
 * - Delegar lógica a controllers inyectados
 * 
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, etc.)
 * @returns {Router} Router configurado de Express
 */
export function buildPagosAportesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    // ============================================
    // LISTADO DE PAGOS
    // ============================================

    /**
     * GET /api/v1/pagos-aportes
     * Listar pagos de aportes con filtros y paginación
     * Query: page, limit, search, sort
     */
    router.get(
        '/',
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listPagosAportesController.handle(req, res, next)
    );

    // ============================================
    // REGISTRO DE PAGO
    // ============================================

    /**
     * POST /api/v1/pagos-aportes
     * Registrar pago de aporte académico
     * Body (multipart/form-data): student_id, payment_method_id, payment_account_id, payment_date, transaction_number, concept, documentoRespaldo (archivo)
     */
    router.post(
        '/',
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
    // DETALLE DE PAGO
    // ============================================

    /**
     * GET /api/v1/pagos-aportes/:id
     * Obtener pago de aporte por ID con todos sus datos relacionados
     */
    router.get(
        '/:id',
        (req, res, next) => controllers.getPaymentAporteByIdController.handle(req, res, next)
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO)
    // ============================================
    // GET /estudiante/:studentId - Obtener pagos de un estudiante

    return router;
}