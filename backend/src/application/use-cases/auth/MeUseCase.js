import { mapPermisosEfectivos } from './mapPermisosEfectivos.js';
import { resolveVinculoPerfilUsuario } from './resolveVinculoPerfilUsuario.js';

/**
 * Caso de uso: perfil actual + permisos efectivos (vista).
 */
export class MeUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/views/UsuarioReferenciaVinculoRepository.js').UsuarioReferenciaVinculoRepository} deps.usuarioReferenciaVinculoRepository
   */
  constructor({ authRepository, userRepository, usuarioReferenciaVinculoRepository }) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
    this.usuarioReferenciaVinculoRepository = usuarioReferenciaVinculoRepository;
  }

  /**
   * @param {number} usuarioId
   * @param {Object} sesionData - Fila de findSesionActiva (snake_case / alias SQL)
   */
  async execute(usuarioId, sesionData) {
    const filas = await this.authRepository.findPermisosEfectivos(usuarioId);
    const permisos = mapPermisosEfectivos(filas);

    const vinculoPerfil = await this.resolveVinculoPerfil(usuarioId);

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
        vinculo_perfil: vinculoPerfil,
      },
      permisos,
    };
  }

  /**
   * Resuelve la persona/ficha vinculada al usuario (mismo shape que el detalle
   * admin). Delegado al helper compartido con LoginUseCase.
   * @param {number} usuarioId
   * @returns {Promise<Object|null>}
   */
  async resolveVinculoPerfil(usuarioId) {
    return resolveVinculoPerfilUsuario({
      userRepository: this.userRepository,
      usuarioReferenciaVinculoRepository: this.usuarioReferenciaVinculoRepository,
      usuarioId,
    });
  }
}
