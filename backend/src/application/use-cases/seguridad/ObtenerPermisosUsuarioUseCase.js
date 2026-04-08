import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  agruparPermisosEfectivos,
} from './permisos-agrupar.helper.js';

const ROL_ADMIN_SISTEMA_ID = 1;

export class ObtenerPermisosUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/RolePermissionRepository.js').RolePermissionRepository} deps.rolePermissionRepository
   * @param {import('../../../infrastructure/repositories/PermissionRepository.js').PermissionRepository} deps.permissionRepository
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   * @param {import('../../../infrastructure/repositories/AuthRepository.js').AuthRepository} deps.authRepository
   */
  constructor({
    userRepository,
    rolePermissionRepository,
    permissionRepository,
    userPermissionRepository,
    authRepository,
  }) {
    this.userRepository = userRepository;
    this.rolePermissionRepository = rolePermissionRepository;
    this.permissionRepository = permissionRepository;
    this.userPermissionRepository = userPermissionRepository;
    this.authRepository = authRepository;
  }

  async execute(usuarioId) {
    const user = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    let permisosRol = [];
    if (user.rol_id) {
      const esAdminSistema = Number(user.rol_id) === ROL_ADMIN_SISTEMA_ID;
      const flat = esAdminSistema
        ? await this.permissionRepository.findAllAccionesValidasFlat()
        : await this.rolePermissionRepository.findFlatByRolId(user.rol_id);
      permisosRol = flat.map((r) => ({
        permiso_id: r.permiso_id,
        codigo: r.codigo,
        nombre: r.nombre ?? null,
        dominio: r.dominio ?? 'GENERAL',
        accion: r.accion,
      }));
    }

    const overridesRaw =
      await this.userPermissionRepository.findOverridesRawByUsuarioId(usuarioId);
    const overrides = overridesRaw.map((o) => ({
      id: o.id,
      codigo: o.codigo,
      accion: o.accion,
      tipo: o.tipo,
      motivo: o.motivo ?? null,
      permiso_id: o.permiso_id,
    }));

    const efectivosFilas = await this.authRepository.findPermisosEfectivos(usuarioId);
    const efectivos = agruparPermisosEfectivos(efectivosFilas);

    return {
      usuario: {
        id: user.id,
        username: user.username,
        email: user.email ?? null,
        rol: user.rol_id
          ? {
              id: user.rol_id,
              codigo: user.rol_codigo ?? null,
              nombre: user.rol_nombre ?? null,
              is_system: Boolean(user.rol_is_system),
              tipo: user.rol_tipo ?? null,
            }
          : null,
      },
      permisos_rol: permisosRol,
      overrides,
      efectivos,
    };
  }
}
