/**
 * Orquesta la eliminación de una cuota (pago_cuotas), sin eliminar la cabecera.
 *
 * @param {Object} dependencies
 * @param {import('@domain/repositories').IPagoAporteRepository} dependencies.pagoAporteRepository
 */
export class EliminarCuotaPagoAporteUseCase {
  constructor({ pagoAporteRepository }) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * @param {string|number} cuotaId
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async ejecutar(cuotaId) {
    return this.pagoAporteRepository.eliminarCuota(cuotaId);
  }
}
