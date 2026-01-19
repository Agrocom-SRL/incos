import express from 'express';
import { registerPagoAporteValidator } from '../validators/pagos/index.js';
import { uploadPaymentDocument } from '../middleware/upload.middleware.js';

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
    // REGISTRO DE PAGO
    // ============================================

    /**
     * POST /api/v1/pagos-aportes
     * Registrar pago de aporte académico
     * Body (multipart/form-data): student_id, payment_method_id, payment_account_id, payment_date, transaction_number, concept, documentoRespaldo (archivo)
     */
    router.post(
        '/',
        uploadPaymentDocument,         // 0. Middleware de upload (antes del validator para tener el archivo)
        registerPagoAporteValidator,   // 1. Validator
        validateRequest,               // 2. Middleware que procesa errores
        (req, res, next) => controllers.registerPagoAporteController.handle(req, res, next)  // 3. Controller
    );

    // ============================================
    // ENDPOINTS FUTUROS (TODO)
    // ============================================
    // GET / - Listar pagos de aportes con filtros
    // GET /:id - Obtener pago por ID
    // GET /estudiante/:studentId - Obtener pagos de un estudiante

    return router;
}