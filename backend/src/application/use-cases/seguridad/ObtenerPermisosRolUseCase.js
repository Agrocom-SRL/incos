import { NotFoundError } from '../../../domain/errors/AppError.js';
import { PERMISO_CATALOGO_REFERENCIA_ID } from '../../../domain/constants/usuarios.constants.js';
import { agruparPermisosRolPorDominio } from './permisos-agrupar.helper.js';

const sinPermisosTecnicos = (rows) =>
  rows.filter((row) => Number(row.permiso_id) !== PERMISO_CATALOGO_REFERENCIA_ID);

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

    const flatRaw = Number(rolId) === 1
      ? await this.permissionRepository.findAllAccionesValidasFlat()
      : await this.rolePermissionRepository.findFlatByRolId(rolId);
    const flat = sinPermisosTecnicos(flatRaw);

    return {
      rol: {
        id: rol.id,
        codigo: rol.code,
        nombre: rol.name,
        is_system: Boolean(rol.isSystem),
      },
      permisos_por_dominio: agruparPermisosRolPorDominio(flat),
    };
  }
}
