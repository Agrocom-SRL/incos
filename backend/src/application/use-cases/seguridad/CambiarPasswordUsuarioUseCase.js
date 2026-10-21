import bcrypt from 'bcryptjs';
import {
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class CambiarPasswordUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   */
  constructor({ userRepository, authRepository }) {
    this.userRepository = userRepository;
    this.authRepository = authRepository;
  }

  async execute(usuarioId, passwordNuevo) {
    const current = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!current) {
      throw new NotFoundError('Usuario');
    }

    if (!passwordNuevo || String(passwordNuevo).length < 8) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'password_nuevo', message: 'password_nuevo debe tener al menos 8 caracteres' },
      ]);
    }

    const passwordHash = await bcrypt.hash(String(passwordNuevo), 12);
    await this.userRepository.update(usuarioId, { passwordHash });
    await this.authRepository.invalidarSesionesUsuario(usuarioId);

    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    return mapUsuarioAdminRow(row);
  }
}
