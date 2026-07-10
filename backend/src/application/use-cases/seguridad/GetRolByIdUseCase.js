import { NotFoundError } from '../../../domain/errors/AppError.js';
import { PERMISO_CATALOGO_REFERENCIA_ID } from '../../../domain/constants/usuarios.constants.js';

const sinPermisosTecnicos = (rows) =>
  rows.filter((row) => Number(row.permiso_id) !== PERMISO_CATALOGO_REFERENCIA_ID);

/**
 * Ficha de detalle de un rol (solo lectura): datos básicos + cantidad de permisos.
 * El conteo reusa la misma lógica que ObtenerPermisosRolUseCase (rol 1 = ADMIN_SISTEMA
 * → catálogo completo de acciones válidas; el resto → permisos efectivos del rol),
 * filtrando permisos técnicos.
 */
export class GetRolByIdUseCase {
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
        tipo: rol.tipo ?? null,
        is_system: Boolean(rol.isSystem),
        cantidadPermisos: flat.length,
      },
    };
  }
}
