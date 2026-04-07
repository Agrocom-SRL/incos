import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Bancos Autorizados
 */
export function buildBancosAutorizadosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const pagoVer = [authenticate, verificarPermiso('finanzas.pago.ver', 'VER')];

    router.get(
        '/',
        ...pagoVer,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listBancosAutorizadosController.handle(req, res, next)
    );

    return router;
}
