import { ConflictError, NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Baja lógica (soft delete) de un usuario del sistema (SEG).
 *
 * Usa el soft delete de BaseRepository (paranoid: establece deleted_at,
 * activo = false y deleted_by). La existencia se valida contra la vista
 * `vista_usuarios_admin_base`, que ya excluye usuarios eliminados; por tanto,
 * un usuario ya borrado se comporta como inexistente (NotFound).
 */
export class EliminarUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   */
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * @param {number} usuarioId - ID del usuario a eliminar
   * @param {number|null} actorId - ID del usuario autenticado que ejecuta la baja
   * @returns {Promise<{ id: number }>}
   */
  async execute(usuarioId, actorId = null) {
    const id = Number(usuarioId);

    const current = await this.userRepository.findByIdWithRoleForAdmin(id);
    if (!current) {
      throw new NotFoundError('Usuario');
    }

    if (actorId != null && Number(actorId) === id) {
      throw new ConflictError('No puede eliminar su propia cuenta de usuario');
    }

    const deleted = await this.userRepository.delete(id, actorId);
    if (!deleted) {
      throw new NotFoundError('Usuario');
    }

    return { id };
  }
}
