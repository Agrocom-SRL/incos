/**
 * Tokens del módulo SEG (usuarios, roles, catálogo permisos).
 */

export const SEGURIDAD_TOKENS = {
  listarUsuariosUseCase: 'seguridad.listarUsuariosUseCase',
  obtenerUsuarioUseCase: 'seguridad.obtenerUsuarioUseCase',
  crearUsuarioUseCase: 'seguridad.crearUsuarioUseCase',
  buscarParaAltaUsuarioVinculosUseCase: 'seguridad.buscarParaAltaUsuarioVinculosUseCase',
  actualizarUsuarioUseCase: 'seguridad.actualizarUsuarioUseCase',
  cambiarEstadoUsuarioUseCase: 'seguridad.cambiarEstadoUsuarioUseCase',
  cambiarPasswordUsuarioUseCase: 'seguridad.cambiarPasswordUsuarioUseCase',
  eliminarUsuarioUseCase: 'seguridad.eliminarUsuarioUseCase',
  obtenerPermisosUsuarioUseCase: 'seguridad.obtenerPermisosUsuarioUseCase',
  agregarOverridePermisoUseCase: 'seguridad.agregarOverridePermisoUseCase',
  eliminarOverridePermisoUseCase: 'seguridad.eliminarOverridePermisoUseCase',
  listarRolesUseCase: 'seguridad.listarRolesUseCase',
  crearRolUseCase: 'seguridad.crearRolUseCase',
  obtenerPermisosRolUseCase: 'seguridad.obtenerPermisosRolUseCase',
  obtenerPermisosGrillaRolUseCase: 'seguridad.obtenerPermisosGrillaRolUseCase',
  actualizarPermisosRolUseCase: 'seguridad.actualizarPermisosRolUseCase',
  getRolByIdUseCase: 'seguridad.getRolByIdUseCase',
  listarUsuariosPorRolUseCase: 'seguridad.listarUsuariosPorRolUseCase',
  listarPermisosUseCase: 'seguridad.listarPermisosUseCase',
  seguridadUsuariosController: 'seguridad.seguridadUsuariosController',
  seguridadRolesController: 'seguridad.seguridadRolesController',
  seguridadPermisosController: 'seguridad.seguridadPermisosController',
  usuariosRouter: 'seguridad.usuariosRouter',
  rolesRouter: 'seguridad.rolesRouter',
  permisosRouter: 'seguridad.permisosRouter',
};
