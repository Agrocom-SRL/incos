import express from 'express';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Cuentas de Pago
 */
export function buildCuentasPagoRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    router.get(
        '/',
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listCuentasPagoController.handle(req, res, next)
    );

    return router;
}
