import { NotFoundError } from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class ObtenerUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   */
  constructor({ userRepository, userPermissionRepository }) {
    this.userRepository = userRepository;
    this.userPermissionRepository = userPermissionRepository;
  }

  async execute(usuarioId) {
    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!row) {
      throw new NotFoundError('Usuario');
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

    return {
      usuario: mapUsuarioAdminRow(row),
      overrides,
    };
  }
}
