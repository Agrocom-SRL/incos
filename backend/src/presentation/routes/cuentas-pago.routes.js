import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Cuentas de Pago
 */
export function buildCuentasPagoRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // Catálogo de referencia: solo autenticación requerida, sin permiso específico

    router.get(
        '/',
        authenticate,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listCuentasPagoController.handle(req, res, next)
    );

    return router;
}
