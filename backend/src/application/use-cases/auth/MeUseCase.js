import { mapPermisosEfectivos } from './mapPermisosEfectivos.js';

/**
 * Caso de uso: perfil actual + permisos efectivos (vista).
 */
export class MeUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   */
  constructor({ authRepository }) {
    this.authRepository = authRepository;
  }

  /**
   * @param {number} usuarioId
   * @param {Object} sesionData - Fila de findSesionActiva (snake_case / alias SQL)
   */
  async execute(usuarioId, sesionData) {
    const filas = await this.authRepository.findPermisosEfectivos(usuarioId);
    const permisos = mapPermisosEfectivos(filas);

    return {
      usuario: {
        id: sesionData.usuario_id,
        username: sesionData.username,
        email: sesionData.email,
        foto_url: sesionData.foto_url,
        rol: {
          id: sesionData.rol_id,
          codigo: sesionData.rol_codigo,
          nombre: sesionData.rol_nombre,
          is_system: Boolean(sesionData.rol_is_system),
          tipo: sesionData.rol_tipo ?? null,
        },
      },
      permisos,
    };
  }
}
