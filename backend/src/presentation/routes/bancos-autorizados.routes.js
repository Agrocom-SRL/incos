import express from 'express';
import { listarCatalogoReferencia } from '../middleware/permisos.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del módulo Bancos Autorizados
 */
export function buildBancosAutorizadosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;
    // Catálogo de referencia: `sistema.catalogo.referencia` + LISTAR (seed 101)

    router.get(
        '/',
        ...listarCatalogoReferencia,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listBancosAutorizadosController.handle(req, res, next)
    );

    return router;
}
