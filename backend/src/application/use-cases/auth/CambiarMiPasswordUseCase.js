import bcrypt from 'bcryptjs';
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';

/**
 * Caso de uso: cambio de contraseña self-service del usuario autenticado.
 * Verifica la contraseña actual antes de actualizar (a diferencia del flujo admin
 * `CambiarPasswordUsuarioUseCase`, que no la verifica y exige permiso administrativo).
 */
export class CambiarMiPasswordUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   */
  constructor({ authRepository, userRepository }) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} input
   * @param {number} input.usuarioId
   * @param {string} input.username
   * @param {string} input.passwordActual
   * @param {string} input.passwordNuevo
   */
  async execute({ usuarioId, username, passwordActual, passwordNuevo }) {
    const usuario = await this.authRepository.findUsuarioParaLogin(username);
    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    const actualOk = await bcrypt.compare(String(passwordActual ?? ''), usuario.password_hash);
    if (!actualOk) {
      throw new UnauthorizedError('La contraseña actual es incorrecta');
    }

    if (!passwordNuevo || String(passwordNuevo).length < 8) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'password_nuevo', message: 'password_nuevo debe tener al menos 8 caracteres' },
      ]);
    }

    const esIgual = await bcrypt.compare(String(passwordNuevo), usuario.password_hash);
    if (esIgual) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'password_nuevo', message: 'La nueva contraseña debe ser distinta de la actual' },
      ]);
    }

    const passwordHash = await bcrypt.hash(String(passwordNuevo), 12);
    await this.userRepository.update(usuarioId, { passwordHash });

    return { ok: true, message: 'Contraseña actualizada correctamente' };
  }
}
