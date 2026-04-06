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

    const mapa = {};
    for (const row of filas) {
      const codigo = row.permiso_codigo;
      const accion = row.accion;
      if (!mapa[codigo]) {
        mapa[codigo] = [];
      }
      mapa[codigo].push(accion);
    }

    const permisos = Object.entries(mapa).map(([codigo, acciones]) => ({
      codigo,
      acciones,
    }));

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
          nivel_acceso: sesionData.rol_nivel,
        },
      },
      permisos,
    };
  }
}
