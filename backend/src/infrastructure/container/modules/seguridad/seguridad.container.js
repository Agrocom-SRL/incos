/**
 * Registro DI: módulo SEG (administración usuarios, roles, permisos).
 */

import { SEGURIDAD_TOKENS } from '../../tokens/seguridad.tokens.js';
import { REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';

import { ListarUsuariosUseCase } from '../../../../application/use-cases/seguridad/ListarUsuariosUseCase.js';
import { ObtenerUsuarioUseCase } from '../../../../application/use-cases/seguridad/ObtenerUsuarioUseCase.js';
import { CrearUsuarioUseCase } from '../../../../application/use-cases/seguridad/CrearUsuarioUseCase.js';
import { BuscarParaAltaUsuarioVinculosUseCase } from '../../../../application/use-cases/seguridad/BuscarParaAltaUsuarioVinculosUseCase.js';
import { ActualizarUsuarioUseCase } from '../../../../application/use-cases/seguridad/ActualizarUsuarioUseCase.js';
import { CambiarEstadoUsuarioUseCase } from '../../../../application/use-cases/seguridad/CambiarEstadoUsuarioUseCase.js';
import { CambiarPasswordUsuarioUseCase } from '../../../../application/use-cases/seguridad/CambiarPasswordUsuarioUseCase.js';
import { ObtenerPermisosUsuarioUseCase } from '../../../../application/use-cases/seguridad/ObtenerPermisosUsuarioUseCase.js';
import { AgregarOverridePermisoUseCase } from '../../../../application/use-cases/seguridad/AgregarOverridePermisoUseCase.js';
import { EliminarOverridePermisoUseCase } from '../../../../application/use-cases/seguridad/EliminarOverridePermisoUseCase.js';
import { ListarRolesUseCase } from '../../../../application/use-cases/seguridad/ListarRolesUseCase.js';
import { ObtenerPermisosRolUseCase } from '../../../../application/use-cases/seguridad/ObtenerPermisosRolUseCase.js';
import { ObtenerPermisosGrillaRolUseCase } from '../../../../application/use-cases/seguridad/ObtenerPermisosGrillaRolUseCase.js';
import { ActualizarPermisosRolUseCase } from '../../../../application/use-cases/seguridad/ActualizarPermisosRolUseCase.js';
import { ListarPermisosUseCase } from '../../../../application/use-cases/seguridad/ListarPermisosUseCase.js';

import { SeguridadUsuariosController } from '../../../../presentation/controllers/seguridad/usuarios.controller.js';
import { SeguridadRolesController } from '../../../../presentation/controllers/seguridad/roles.controller.js';
import { SeguridadPermisosController } from '../../../../presentation/controllers/seguridad/permisos.controller.js';

import { buildUsuariosRouter } from '../../../../presentation/routes/usuarios.routes.js';
import { buildRolesRouter } from '../../../../presentation/routes/roles.routes.js';
import { buildPermisosRouter } from '../../../../presentation/routes/permisos.routes.js';

export function registerSeguridadModule(container) {
  registerComponent(
    container,
    SEGURIDAD_TOKENS.listarUsuariosUseCase,
    (c) =>
      new ListarUsuariosUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.obtenerUsuarioUseCase,
    (c) =>
      new ObtenerUsuarioUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        userPermissionRepository: c.resolve(REPOSITORIOS_TOKENS.userPermissionRepository),
        usuarioReferenciaVinculoRepository: c.resolve(
          REPOSITORIOS_TOKENS.userReferenceLinkRepository
        ),
        staffRepository: c.resolve(REPOSITORIOS_TOKENS.staffRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.crearUsuarioUseCase,
    (c) =>
      new CrearUsuarioUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        roleRepository: c.resolve(REPOSITORIOS_TOKENS.roleRepository),
        staffRepository: c.resolve(REPOSITORIOS_TOKENS.staffRepository),
        studentRepository: c.resolve(REPOSITORIOS_TOKENS.studentRepository),
        teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
        rectorRepository: c.resolve(REPOSITORIOS_TOKENS.rectorRepository),
        directorRepository: c.resolve(REPOSITORIOS_TOKENS.directorRepository),
        secretaryRepository: c.resolve(REPOSITORIOS_TOKENS.secretaryRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.buscarParaAltaUsuarioVinculosUseCase,
    (c) =>
      new BuscarParaAltaUsuarioVinculosUseCase({
        seguridadAltaUsuarioLookupRepository: c.resolve(
          REPOSITORIOS_TOKENS.securityUserRegistrationLookupRepository
        ),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.actualizarUsuarioUseCase,
    (c) =>
      new ActualizarUsuarioUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        roleRepository: c.resolve(REPOSITORIOS_TOKENS.roleRepository),
        staffRepository: c.resolve(REPOSITORIOS_TOKENS.staffRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.cambiarEstadoUsuarioUseCase,
    (c) =>
      new CambiarEstadoUsuarioUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.cambiarPasswordUsuarioUseCase,
    (c) =>
      new CambiarPasswordUsuarioUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.obtenerPermisosUsuarioUseCase,
    (c) =>
      new ObtenerPermisosUsuarioUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        rolePermissionRepository: c.resolve(REPOSITORIOS_TOKENS.rolePermissionRepository),
        permissionRepository: c.resolve(REPOSITORIOS_TOKENS.permissionRepository),
        userPermissionRepository: c.resolve(REPOSITORIOS_TOKENS.userPermissionRepository),
        authRepository: c.resolve(REPOSITORIOS_TOKENS.authRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.agregarOverridePermisoUseCase,
    (c) =>
      new AgregarOverridePermisoUseCase({
        userRepository: c.resolve(REPOSITORIOS_TOKENS.userRepository),
        permissionRepository: c.resolve(REPOSITORIOS_TOKENS.permissionRepository),
        userPermissionRepository: c.resolve(REPOSITORIOS_TOKENS.userPermissionRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.eliminarOverridePermisoUseCase,
    (c) =>
      new EliminarOverridePermisoUseCase({
        userPermissionRepository: c.resolve(REPOSITORIOS_TOKENS.userPermissionRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.listarRolesUseCase,
    (c) =>
      new ListarRolesUseCase({
        roleRepository: c.resolve(REPOSITORIOS_TOKENS.roleRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.obtenerPermisosRolUseCase,
    (c) =>
      new ObtenerPermisosRolUseCase({
        roleRepository: c.resolve(REPOSITORIOS_TOKENS.roleRepository),
        rolePermissionRepository: c.resolve(REPOSITORIOS_TOKENS.rolePermissionRepository),
        permissionRepository: c.resolve(REPOSITORIOS_TOKENS.permissionRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.obtenerPermisosGrillaRolUseCase,
    (c) =>
      new ObtenerPermisosGrillaRolUseCase({
        rolPermisoRepository: c.resolve(REPOSITORIOS_TOKENS.rolePermissionRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.actualizarPermisosRolUseCase,
    (c) =>
      new ActualizarPermisosRolUseCase({
        roleRepository: c.resolve(REPOSITORIOS_TOKENS.roleRepository),
        permissionRepository: c.resolve(REPOSITORIOS_TOKENS.permissionRepository),
        rolePermissionRepository: c.resolve(REPOSITORIOS_TOKENS.rolePermissionRepository),
        obtenerPermisosRolUseCase: c.resolve(SEGURIDAD_TOKENS.obtenerPermisosRolUseCase),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.listarPermisosUseCase,
    (c) =>
      new ListarPermisosUseCase({
        permissionRepository: c.resolve(REPOSITORIOS_TOKENS.permissionRepository),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.seguridadUsuariosController,
    (c) =>
      new SeguridadUsuariosController({
        listarUsuariosUseCase: c.resolve(SEGURIDAD_TOKENS.listarUsuariosUseCase),
        obtenerUsuarioUseCase: c.resolve(SEGURIDAD_TOKENS.obtenerUsuarioUseCase),
        crearUsuarioUseCase: c.resolve(SEGURIDAD_TOKENS.crearUsuarioUseCase),
        buscarParaAltaUsuarioVinculosUseCase: c.resolve(
          SEGURIDAD_TOKENS.buscarParaAltaUsuarioVinculosUseCase
        ),
        actualizarUsuarioUseCase: c.resolve(SEGURIDAD_TOKENS.actualizarUsuarioUseCase),
        cambiarEstadoUsuarioUseCase: c.resolve(SEGURIDAD_TOKENS.cambiarEstadoUsuarioUseCase),
        cambiarPasswordUsuarioUseCase: c.resolve(
          SEGURIDAD_TOKENS.cambiarPasswordUsuarioUseCase
        ),
        obtenerPermisosUsuarioUseCase: c.resolve(
          SEGURIDAD_TOKENS.obtenerPermisosUsuarioUseCase
        ),
        agregarOverridePermisoUseCase: c.resolve(
          SEGURIDAD_TOKENS.agregarOverridePermisoUseCase
        ),
        eliminarOverridePermisoUseCase: c.resolve(
          SEGURIDAD_TOKENS.eliminarOverridePermisoUseCase
        ),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.seguridadRolesController,
    (c) =>
      new SeguridadRolesController({
        listarRolesUseCase: c.resolve(SEGURIDAD_TOKENS.listarRolesUseCase),
        obtenerPermisosRolUseCase: c.resolve(SEGURIDAD_TOKENS.obtenerPermisosRolUseCase),
        obtenerPermisosGrillaRolUseCase: c.resolve(
          SEGURIDAD_TOKENS.obtenerPermisosGrillaRolUseCase
        ),
        actualizarPermisosRolUseCase: c.resolve(
          SEGURIDAD_TOKENS.actualizarPermisosRolUseCase
        ),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.seguridadPermisosController,
    (c) =>
      new SeguridadPermisosController({
        listarPermisosUseCase: c.resolve(SEGURIDAD_TOKENS.listarPermisosUseCase),
        responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.usuariosRouter,
    (c) =>
      buildUsuariosRouter({
        seguridadUsuariosController: c.resolve(SEGURIDAD_TOKENS.seguridadUsuariosController),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.rolesRouter,
    (c) =>
      buildRolesRouter({
        seguridadRolesController: c.resolve(SEGURIDAD_TOKENS.seguridadRolesController),
      })
  );

  registerComponent(
    container,
    SEGURIDAD_TOKENS.permisosRouter,
    (c) =>
      buildPermisosRouter({
        seguridadPermisosController: c.resolve(
          SEGURIDAD_TOKENS.seguridadPermisosController
        ),
      })
  );

  return container;
}
