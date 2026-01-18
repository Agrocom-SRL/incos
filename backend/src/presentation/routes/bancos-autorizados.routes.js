import express from 'express';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Bancos Autorizados
 */
export function buildBancosAutorizadosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    router.get(
        '/',
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listBancosAutorizadosController.handle(req, res, next)
    );

    return router;
}
