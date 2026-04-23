import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class ActualizarUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   */
  constructor({ userRepository, roleRepository }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  /**
   * @param {number} usuarioId
   * @param {Object} body
   */
  async execute(usuarioId, body) {
    const current = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!current) {
      throw new NotFoundError('Usuario');
    }

    const patch = {};
    if (body.username !== undefined) {
      patch.username = String(body.username).trim();
      if (patch.username !== current.username) {
        if (await this.userRepository.existsUsername(patch.username, usuarioId)) {
          throw new ConflictError('El nombre de usuario ya está en uso');
        }
      }
    }
    if (body.rol_id !== undefined) {
      const role = await this.roleRepository.findById(body.rol_id);
      if (!role) {
        throw new NotFoundError('Rol');
      }
      patch.roleId = body.rol_id;
    }
    if (body.foto_url !== undefined) {
      patch.photoUrl = body.foto_url;
    }

    if (Object.keys(patch).length === 0) {
      return mapUsuarioAdminRow(current);
    }

    await this.userRepository.update(usuarioId, patch);
    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    return mapUsuarioAdminRow(row);
  }
}
