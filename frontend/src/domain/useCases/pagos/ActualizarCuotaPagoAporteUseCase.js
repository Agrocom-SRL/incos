/**
 * @param {Object} dependencies
 * @param {import('@domain/repositories').IPagoAporteRepository} dependencies.pagoAporteRepository
 */
export class ActualizarCuotaPagoAporteUseCase {
  constructor({ pagoAporteRepository }) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * @param {string|number} cuotaId
   * @param {Object} payload - amount, payment_method_id, payment_account_id, payment_date, transaction_number, codigo_comprobante, descripcion
   */
  async ejecutar(cuotaId, payload) {
    return this.pagoAporteRepository.actualizarCuota(cuotaId, payload);
  }
}
