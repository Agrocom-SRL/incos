import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  permisosCatalogoQueryValidator,
  validateSeguridadRequest,
} from '../validators/seguridad/usuarios.validator.js';

/**
 * Catálogo de permisos (módulo SEG).
 *
 * @param {Object} params
 * @param {import('../controllers/seguridad/permisos.controller.js').SeguridadPermisosController} params.seguridadPermisosController
 */
export function buildPermisosRouter({ seguridadPermisosController }) {
  const router = express.Router();
  const listarCatalogo = [authenticate, verificarPermiso('seguridad.rol.gestionar', 'LISTAR')];

  router.get(
    '/',
    ...listarCatalogo,
    permisosCatalogoQueryValidator,
    validateSeguridadRequest,
    (req, res, next) => seguridadPermisosController.list(req, res, next)
  );

  return router;
}
