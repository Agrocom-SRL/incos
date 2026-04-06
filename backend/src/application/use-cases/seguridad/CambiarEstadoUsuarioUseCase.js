import {
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import { ESTADOS_USUARIOS_VALUES } from '../../../domain/constants/usuarios.constants.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class CambiarEstadoUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   */
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * @param {number} usuarioId
   * @param {{ estado: string|null, motivo?: string|null }} body
   */
  async execute(usuarioId, body) {
    const current = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!current) {
      throw new NotFoundError('Usuario');
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

    const state = estado;
    const motivo = state === null ? null : body.motivo ?? null;

    await this.userRepository.update(usuarioId, {
      state,
      stateChangeDate: new Date(),
      stateChangeReason: motivo,
    });

    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    return mapUsuarioAdminRow(row);
  }
}
