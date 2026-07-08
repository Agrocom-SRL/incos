import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listarCatalogoReferencia, verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import {
    createBancoAutorizadoValidator,
    updateBancoAutorizadoValidator,
} from '../validators/pagos/index.js';
import { setEstadoCatalogoValidator } from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Bancos Autorizados
 */
export function buildBancosAutorizadosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // Catálogo de referencia: `sistema.catalogo.referencia` + LISTAR (seed 101)
    const configCrear = [authenticate, verificarPermiso('finanzas.configuracion.pago', 'CREAR')];
    const configEditar = [authenticate, verificarPermiso('finanzas.configuracion.pago', 'EDITAR')];
    const configEliminar = [authenticate, verificarPermiso('finanzas.configuracion.pago', 'ELIMINAR')];
    const configActivar = [authenticate, verificarPermiso('finanzas.configuracion.pago', 'ACTIVAR')];

    router.get(
        '/',
        ...listarCatalogoReferencia,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listBancosAutorizadosController.handle(req, res, next)
    );

    router.post(
        '/',
        ...configCrear,
        createBancoAutorizadoValidator,
        validateRequest,
        (req, res, next) => controllers.createBancoAutorizadoController.handle(req, res, next)
    );

    router.put(
        '/:id',
        ...configEditar,
        idValidator,
        updateBancoAutorizadoValidator,
        validateRequest,
        (req, res, next) => controllers.updateBancoAutorizadoController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar banco autorizado (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...configActivar,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoBancoAutorizadoController.handle(req, res, next)
    );

    router.delete(
        '/:id',
        ...configEliminar,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteBancoAutorizadoController.handle(req, res, next)
    );

    return router;
}
