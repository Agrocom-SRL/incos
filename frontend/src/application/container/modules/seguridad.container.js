import {
  ActualizarPermisosRolUseCase,
  ActualizarUsuarioUseCase,
  EliminarUsuarioUseCase,
  AgregarOverridePermisoUseCase,
  CambiarEstadoUsuarioUseCase,
  CambiarPasswordUseCase,
  CrearRolUseCase,
  CrearUsuarioUseCase,
  EliminarOverridePermisoUseCase,
  ListarPermisosUseCase,
  ListarRolesUseCase,
  ListarUsuariosPorRolUseCase,
  ListarUsuariosUseCase,
  ObtenerPermisosRolUseCase,
  ObtenerPermisosGrillaRolUseCase,
  ObtenerPermisosUsuarioUseCase,
  ObtenerRolUseCase,
  ObtenerUsuarioUseCase,
} from '@/application/use-cases/seguridad';
import UsuarioAdminRepository from '@/infrastructure/repositories/seguridad/UsuarioAdminRepository';
import RolAdminRepository from '@/infrastructure/repositories/seguridad/RolAdminRepository';
import PermisoAdminRepository from '@/infrastructure/repositories/seguridad/PermisoAdminRepository';

export function registerSeguridadModule(factory) {
  factory.listarUsuariosAdmin = () => new ListarUsuariosUseCase(UsuarioAdminRepository);
  factory.obtenerUsuarioAdmin = () => new ObtenerUsuarioUseCase(UsuarioAdminRepository);
  factory.crearUsuarioAdmin = () => new CrearUsuarioUseCase(UsuarioAdminRepository);
  factory.actualizarUsuarioAdmin = () => new ActualizarUsuarioUseCase(UsuarioAdminRepository);
  factory.eliminarUsuarioAdmin = () => new EliminarUsuarioUseCase(UsuarioAdminRepository);
  factory.cambiarEstadoUsuarioAdmin = () => new CambiarEstadoUsuarioUseCase(UsuarioAdminRepository);
  factory.cambiarPasswordUsuarioAdmin = () => new CambiarPasswordUseCase(UsuarioAdminRepository);
  factory.obtenerPermisosUsuarioAdmin = () => new ObtenerPermisosUsuarioUseCase(UsuarioAdminRepository);
  factory.agregarOverridePermisoAdmin = () => new AgregarOverridePermisoUseCase(UsuarioAdminRepository);
  factory.eliminarOverridePermisoAdmin = () => new EliminarOverridePermisoUseCase(UsuarioAdminRepository);
  factory.listarRolesAdmin = () => new ListarRolesUseCase(RolAdminRepository);
  factory.crearRolAdmin = () => new CrearRolUseCase(RolAdminRepository);
  factory.obtenerRolAdmin = () => new ObtenerRolUseCase(RolAdminRepository);
  factory.listarUsuariosPorRolAdmin = () => new ListarUsuariosPorRolUseCase(RolAdminRepository);
  factory.obtenerPermisosRolAdmin = () => new ObtenerPermisosRolUseCase(RolAdminRepository);
  factory.obtenerPermisosGrillaRolAdmin = () =>
    new ObtenerPermisosGrillaRolUseCase(RolAdminRepository);
  factory.actualizarPermisosRolAdmin = () => new ActualizarPermisosRolUseCase(RolAdminRepository);
  factory.listarPermisosAdmin = () => new ListarPermisosUseCase(PermisoAdminRepository);
  return factory;
}

