import { IAuthorizedBankRepository } from '@domain/repositories';

export class CambiarEstadoBancoAutorizadoUseCase {
  /**
   * @param {IAuthorizedBankRepository} authorizedBankRepository
   */
  constructor(authorizedBankRepository) {
    this.authorizedBankRepository = authorizedBankRepository;
  }

  /**
   * Activa/desactiva un banco autorizado (toggle rápido del listado de Config. de pagos)
   *
   * @param {string|number} bancoId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(bancoId, activo) {
    try {
      if (!bancoId) {
        return { success: false, error: 'El ID del banco es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.authorizedBankRepository.cambiarEstado(bancoId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del banco autorizado'
            : result.error || 'Error al cambiar el estado del banco autorizado';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del banco autorizado',
      };
    }
  }
}
