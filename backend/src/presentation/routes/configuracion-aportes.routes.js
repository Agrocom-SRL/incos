import express from 'express';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Configuración de Aportes
 */
export function buildConfiguracionAportesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    router.get(
        '/',
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listConfiguracionAportesController.handle(req, res, next)
    );

    return router;
}
