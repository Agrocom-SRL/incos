import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  actualizarPermisosRolValidator,
  crearRolValidator,
  rolIdParamValidator,
  rolUsuariosListQueryValidator,
  validateSeguridadRequest,
} from '../validators/seguridad/usuarios.validator.js';

/**
 * @param {Object} params
 * @param {import('../controllers/seguridad/roles.controller.js').SeguridadRolesController} params.seguridadRolesController
 */
export function buildRolesRouter({ seguridadRolesController }) {
  const router = express.Router();
  const c = seguridadRolesController;

  const ver = [authenticate, verificarPermiso('seguridad.rol.gestionar', 'LISTAR')];
  const crear = [
    authenticate,
    verificarPermiso('seguridad.rol.gestionar', 'CREAR'),
  ];
  const editar = [
    authenticate,
    verificarPermiso('seguridad.rol.gestionar', 'EDITAR'),
  ];
  const detalle = [
    authenticate,
    verificarPermiso('seguridad.rol.gestionar', 'DETALLE'),
  ];

  router.get('/', ...ver, (req, res, next) => c.list(req, res, next));

  router.post(
    '/',
    ...crear,
    crearRolValidator,
    validateSeguridadRequest,
    (req, res, next) => c.create(req, res, next)
  );

  router.get(
    '/:id/permisos',
    ...ver,
    rolIdParamValidator,
    validateSeguridadRequest,
    (req, res, next) => c.getPermisos(req, res, next)
  );

  router.get(
    '/:id/permisos-grilla',
    ...ver,
    rolIdParamValidator,
    validateSeguridadRequest,
    (req, res, next) => {
      if (!req.query.dominio) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro dominio es obligatorio',
        });
      }
      return c.getPermisosGrilla(req, res, next);
    }
  );

  router.put(
    '/:id/permisos',
    ...editar,
    rolIdParamValidator,
    actualizarPermisosRolValidator,
    validateSeguridadRequest,
    (req, res, next) => c.putPermisos(req, res, next)
  );

  router.get(
    '/:id/usuarios',
    ...detalle,
    rolIdParamValidator,
    rolUsuariosListQueryValidator,
    validateSeguridadRequest,
    (req, res, next) => c.getUsuarios(req, res, next)
  );

  router.get(
    '/:id',
    ...detalle,
    rolIdParamValidator,
    validateSeguridadRequest,
    (req, res, next) => c.getById(req, res, next)
  );

  return router;
}
