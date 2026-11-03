import bcrypt from 'bcryptjs';
import { NotFoundError } from '../../../domain/errors/AppError.js';
import { validarPasswordNueva } from '../../utils/passwordPolicy.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';
import { ROL_ADMIN_SISTEMA_CODIGO, exigirActorAdminSistema } from './rol-admin-sistema.guard.js';

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

  /**
   * @param {number} usuarioId
   * @param {string} passwordNuevo
   * @param {number|null} actorId usuario autenticado (solo un ADMIN_SISTEMA puede tocar a otro ADMIN_SISTEMA)
   */
  async execute(usuarioId, passwordNuevo, actorId = null) {
    const current = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!current) {
      throw new NotFoundError('Usuario');
    }

    if (current.rol_codigo === ROL_ADMIN_SISTEMA_CODIGO) {
      await exigirActorAdminSistema(this.userRepository, actorId);
    }

    validarPasswordNueva(passwordNuevo, 'password_nuevo');

    const passwordHash = await bcrypt.hash(String(passwordNuevo), 12);
    await this.userRepository.update(usuarioId, { passwordHash });
    await this.authRepository.invalidarSesionesUsuario(usuarioId);

    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    return mapUsuarioAdminRow(row);
  }
}
