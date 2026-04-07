import { NotFoundError } from '../../../domain/errors/AppError.js';
import { agruparPermisosRolPorDominio } from './permisos-agrupar.helper.js';

export class ObtenerPermisosRolUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   * @param {import('../../../infrastructure/repositories/RolePermissionRepository.js').RolePermissionRepository} deps.rolePermissionRepository
   * @param {import('../../../infrastructure/repositories/PermissionRepository.js').PermissionRepository} deps.permissionRepository
   */
  constructor({ roleRepository, rolePermissionRepository, permissionRepository }) {
    this.roleRepository = roleRepository;
    this.rolePermissionRepository = rolePermissionRepository;
    this.permissionRepository = permissionRepository;
  }

  async execute(rolId) {
    const rol = await this.roleRepository.findById(rolId);
    if (!rol) {
      throw new NotFoundError('Rol');
    }

    const flat = Number(rolId) === 8
      ? await this.permissionRepository.findAllAccionesValidasFlat()
      : await this.rolePermissionRepository.findFlatByRolId(rolId);

    return {
      rol: {
        id: rol.id,
        codigo: rol.code,
        nombre: rol.name,
        nivel_acceso: rol.accessLevel,
      },
      permisos_por_dominio: agruparPermisosRolPorDominio(flat),
    };
  }
}
