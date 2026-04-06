import bcrypt from 'bcryptjs';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class CrearUsuarioUseCase {
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
   * @param {Object} input
   */
  async execute(input) {
    const username = String(input.username || '').trim();
    const email = String(input.email || '').trim().toLowerCase();
    const password = input.password;
    const rolId = input.rol_id;

    if (!password || String(password).length < 8) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'password', message: 'password debe tener al menos 8 caracteres' },
      ]);
    }

    const role = await this.roleRepository.findById(rolId);
    if (!role) {
      throw new NotFoundError('Rol');
    }

    if (await this.userRepository.existsUsername(username)) {
      throw new ConflictError('El nombre de usuario ya está en uso');
    }
    if (await this.userRepository.existsEmail(email)) {
      throw new ConflictError('El email ya está en uso');
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const created = await this.userRepository.create({
      username,
      email,
      passwordHash,
      roleId: rolId,
      referenceId: input.referencia_id ?? null,
      referenceType: input.tipo_referencia ?? null,
    });

    const row = await this.userRepository.findByIdWithRoleForAdmin(created.id);
    return mapUsuarioAdminRow(row);
  }
}
