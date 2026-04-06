import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  agruparPermisosEfectivos,
} from './permisos-agrupar.helper.js';

export class ObtenerPermisosUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/RolePermissionRepository.js').RolePermissionRepository} deps.rolePermissionRepository
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   * @param {import('../../../infrastructure/repositories/AuthRepository.js').AuthRepository} deps.authRepository
   */
  constructor({
    userRepository,
    rolePermissionRepository,
    userPermissionRepository,
    authRepository,
  }) {
    this.userRepository = userRepository;
    this.rolePermissionRepository = rolePermissionRepository;
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
      const flat = await this.rolePermissionRepository.findFlatByRolId(user.rol_id);
      permisosRol = flat.map((r) => ({
        codigo: r.codigo,
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
      permisos_rol: permisosRol,
      overrides,
      efectivos,
    };
  }
}
