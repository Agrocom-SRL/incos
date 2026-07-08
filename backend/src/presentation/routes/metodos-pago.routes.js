import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listarCatalogoReferencia, verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import { updateMetodoPagoValidator } from '../validators/pagos/index.js';
import { setEstadoCatalogoValidator } from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Métodos de Pago
 */
export function buildMetodosPagoRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // Catálogo de referencia: `sistema.catalogo.referencia` + LISTAR (seed 101)
    const configEditar = [authenticate, verificarPermiso('finanzas.configuracion.pago', 'EDITAR')];
    const configActivar = [authenticate, verificarPermiso('finanzas.configuracion.pago', 'ACTIVAR')];

    router.get(
        '/',
        ...listarCatalogoReferencia,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listMetodosPagoController.handle(req, res, next)
    );

    // Editar nombre y/o togglear `activo` (códigos fijos, no se crea ni elimina).
    router.put(
        '/:id',
        ...configEditar,
        idValidator,
        updateMetodoPagoValidator,
        validateRequest,
        (req, res, next) => controllers.updateMetodoPagoController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar método de pago (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...configActivar,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoMetodoPagoController.handle(req, res, next)
    );

    return router;
}
