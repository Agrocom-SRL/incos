import { IPaymentMethodRepository } from '@domain/repositories';

export class CambiarEstadoMetodoPagoUseCase {
  /**
   * @param {IPaymentMethodRepository} paymentMethodRepository
   */
  constructor(paymentMethodRepository) {
    this.paymentMethodRepository = paymentMethodRepository;
  }

  /**
   * Activa/desactiva un método de pago (toggle rápido del listado de Config. de pagos)
   *
   * @param {string|number} metodoPagoId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(metodoPagoId, activo) {
    try {
      if (!metodoPagoId) {
        return { success: false, error: 'El ID del método de pago es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.paymentMethodRepository.cambiarEstado(metodoPagoId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del método de pago'
            : result.error || 'Error al cambiar el estado del método de pago';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del método de pago',
      };
    }
  }
}
