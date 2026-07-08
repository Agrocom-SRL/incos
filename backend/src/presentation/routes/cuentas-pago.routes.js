import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listarCatalogoReferencia, verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator, idValidator } from '../validators/common/index.js';
import { uploadCuentaPagoQr } from '../middleware/upload.middleware.js';
import {
    createCuentaPagoValidator,
    updateCuentaPagoValidator,
} from '../validators/pagos/index.js';
import { setEstadoCatalogoValidator } from '../validators/referencia/index.js';

/**
 * Construye el router del módulo Cuentas de Pago
 *
 * POST/PUT aceptan multipart (archivo `qr` opcional). El middleware
 * `uploadCuentaPagoQr` corre antes de los validators para poblar req.body
 * (campos de texto) y req.file (la imagen QR).
 */
export function buildCuentasPagoRouter({ controllers, middlewares }) {
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
        (req, res, next) => controllers.listCuentasPagoController.handle(req, res, next)
    );

    router.post(
        '/',
        ...configCrear,
        uploadCuentaPagoQr,
        createCuentaPagoValidator,
        validateRequest,
        (req, res, next) => controllers.createCuentaPagoController.handle(req, res, next)
    );

    router.put(
        '/:id',
        ...configEditar,
        uploadCuentaPagoQr,
        idValidator,
        updateCuentaPagoValidator,
        validateRequest,
        (req, res, next) => controllers.updateCuentaPagoController.handle(req, res, next)
    );

    // PATCH /:id/estado - Activar/desactivar cuenta de pago (body: { activo: boolean })
    router.patch(
        '/:id/estado',
        ...configActivar,
        idValidator,
        setEstadoCatalogoValidator,
        validateRequest,
        (req, res, next) => controllers.setEstadoCuentaPagoController.handle(req, res, next)
    );

    router.delete(
        '/:id',
        ...configEliminar,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.deleteCuentaPagoController.handle(req, res, next)
    );

    return router;
}
