import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import {
    createConfiguracionAporteValidator,
    updateConfiguracionAporteValidator,
} from '../validators/pagos/index.js';

/**
 * Construye el router del módulo Configuración de Aportes
 */
export function buildConfiguracionAportesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    const configListar = [authenticate, verificarPermiso('finanzas.aporte', 'LISTAR')];
    const configCrear = [authenticate, verificarPermiso('finanzas.aporte', 'CREAR')];
    const configEditar = [authenticate, verificarPermiso('finanzas.aporte', 'EDITAR')];

    router.get(
        '/',
        ...configListar,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listConfiguracionAportesController.handle(req, res, next)
    );

    router.post(
        '/',
        ...configCrear,
        createConfiguracionAporteValidator,
        validateRequest,
        (req, res, next) => controllers.createConfiguracionAporteController.handle(req, res, next)
    );

    router.put(
        '/:id',
        ...configEditar,
        idValidator,
        updateConfiguracionAporteValidator,
        validateRequest,
        (req, res, next) => controllers.updateConfiguracionAporteController.handle(req, res, next)
    );

    return router;
}
