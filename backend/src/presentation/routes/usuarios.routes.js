import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import {
  actualizarUsuarioValidator,
  agregarOverrideValidator,
  cambiarEstadoUsuarioBodyValidator,
  cambiarPasswordValidator,
  crearUsuarioValidator,
  overrideIdParamValidator,
  usuarioIdParamValidator,
  usuariosListQueryValidator,
  validateSeguridadRequest,
} from '../validators/seguridad/usuarios.validator.js';

/**
 * @param {Object} params
 * @param {import('../controllers/seguridad/usuarios.controller.js').SeguridadUsuariosController} params.seguridadUsuariosController
 */
export function buildUsuariosRouter({ seguridadUsuariosController }) {
  const router = express.Router();
  const c = seguridadUsuariosController;

  const adminListar = [authenticate, verificarPermiso('seguridad.usuario.administrar', 'LISTAR')];
  const adminDetalle = [authenticate, verificarPermiso('seguridad.usuario.administrar', 'DETALLE')];
  const adminEditar = [
    authenticate,
    verificarPermiso('seguridad.usuario.administrar', 'EDITAR'),
  ];
  const crearUsuario = [
    authenticate,
    verificarPermiso('seguridad.usuario.crear', 'CREAR'),
  ];
  const rolGestionarListar = [
    authenticate,
    verificarPermiso('seguridad.rol.gestionar', 'LISTAR'),
  ];
  const rolGestionarEditar = [
    authenticate,
    verificarPermiso('seguridad.rol.gestionar', 'EDITAR'),
  ];

  router.get(
    '/',
    ...adminListar,
    usuariosListQueryValidator,
    validateSeguridadRequest,
    (req, res, next) => c.list(req, res, next)
  );

  router.post(
    '/',
    ...crearUsuario,
    crearUsuarioValidator,
    validateSeguridadRequest,
    (req, res, next) => c.create(req, res, next)
  );

  router.get(
    '/:id/permisos',
    ...rolGestionarListar,
    usuarioIdParamValidator,
    validateSeguridadRequest,
    (req, res, next) => c.getPermisos(req, res, next)
  );

  router.post(
    '/:id/permisos',
    ...rolGestionarEditar,
    usuarioIdParamValidator,
    agregarOverrideValidator,
    validateSeguridadRequest,
    (req, res, next) => c.addPermiso(req, res, next)
  );

  router.delete(
    '/:id/permisos/:overrideId',
    ...rolGestionarEditar,
    ...usuarioIdParamValidator,
    ...overrideIdParamValidator,
    validateSeguridadRequest,
    (req, res, next) => c.deletePermiso(req, res, next)
  );

  router.get(
    '/:id',
    ...adminDetalle,
    usuarioIdParamValidator,
    validateSeguridadRequest,
    (req, res, next) => c.getById(req, res, next)
  );

  router.put(
    '/:id',
    ...adminEditar,
    usuarioIdParamValidator,
    actualizarUsuarioValidator,
    validateSeguridadRequest,
    (req, res, next) => c.update(req, res, next)
  );

  router.patch(
    '/:id/estado',
    ...adminEditar,
    usuarioIdParamValidator,
    cambiarEstadoUsuarioBodyValidator,
    validateSeguridadRequest,
    (req, res, next) => c.patchEstado(req, res, next)
  );

  router.patch(
    '/:id/password',
    ...adminEditar,
    usuarioIdParamValidator,
    cambiarPasswordValidator,
    validateSeguridadRequest,
    (req, res, next) => c.patchPassword(req, res, next)
  );

  return router;
}
