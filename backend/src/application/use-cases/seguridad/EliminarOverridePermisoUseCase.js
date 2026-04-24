import { NotFoundError } from '../../../domain/errors/AppError.js';

export class EliminarOverridePermisoUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   */
  constructor({ userPermissionRepository }) {
    this.userPermissionRepository = userPermissionRepository;
  }

  async execute(usuarioId, overrideId) {
    const affected = await this.userPermissionRepository.softDeleteOverrideForUser(
      overrideId,
      usuarioId
    );
    if (!affected) {
      throw new NotFoundError('Override de permiso');
    }
    return { message: 'Override eliminado correctamente' };
  }
}
