import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Configuración de Aportes
 */
export function buildConfiguracionAportesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const configListar = [authenticate, verificarPermiso('cfg.pagos.gestionar', 'LISTAR')];

    router.get(
        '/',
        ...configListar,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listConfiguracionAportesController.handle(req, res, next)
    );

    return router;
}
