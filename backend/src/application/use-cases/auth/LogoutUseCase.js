/**
 * Caso de uso: cierre de sesión (invalida fila en sesiones).
 */
export class LogoutUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   */
  constructor({ authRepository }) {
    this.authRepository = authRepository;
  }

  /**
   * @param {string} token
   */
  async execute(token) {
    await this.authRepository.invalidarSesion(token);
    return { message: 'Sesión cerrada correctamente' };
  }
}
