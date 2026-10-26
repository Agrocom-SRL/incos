import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import { ESTADOS_USUARIOS_VALUES } from '../../../domain/constants/usuarios.constants.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';
import { ROL_ADMIN_SISTEMA_CODIGO, exigirActorAdminSistema } from './rol-admin-sistema.guard.js';

export class CambiarEstadoUsuarioUseCase {
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
   * @param {{ estado: string|null, motivo?: string|null }} body
   * @param {number|null} actorId usuario autenticado que ejecuta el cambio
   */
  async execute(usuarioId, body, actorId = null) {
    const current = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!current) {
      throw new NotFoundError('Usuario');
    }

    if (current.rol_codigo === ROL_ADMIN_SISTEMA_CODIGO) {
      await exigirActorAdminSistema(this.userRepository, actorId);
    }

    if (!Object.prototype.hasOwnProperty.call(body, 'estado')) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'estado', message: 'estado es requerido (use null para reactivar)' },
      ]);
    }

    const estado = body.estado;
    if (estado !== null && !ESTADOS_USUARIOS_VALUES.includes(estado)) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        {
          field: 'estado',
          message: `estado debe ser null o uno de: ${ESTADOS_USUARIOS_VALUES.join(', ')}`,
        },
      ]);
    }

    if (estado !== null && actorId != null && Number(actorId) === Number(usuarioId)) {
      throw new ConflictError('No puede bloquear ni suspender su propia cuenta');
    }

    const state = estado;
    const motivo = state === null ? null : body.motivo ?? null;

    await this.userRepository.update(usuarioId, {
      state,
      stateChangeDate: new Date(),
      stateChangeReason: motivo,
    });

    if (state !== null) {
      await this.authRepository.invalidarSesionesUsuario(usuarioId);
    }

    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    return mapUsuarioAdminRow(row);
  }
}
