/**
 * Use Case: EliminarPagoAporteUseCase
 * 
 * Single Responsibility: Orquestar la eliminación de un pago de aporte
 * 
 * Clean Architecture:
 * - Domain Layer: Lógica de negocio para eliminar pagos
 * - Depende de: IPagoAporteRepository (abstracción)
 */

export class EliminarPagoAporteUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {IPagoAporteRepository} dependencies.pagoAporteRepository - Repositorio de pagos
   */
  constructor({ pagoAporteRepository }) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * Ejecuta la eliminación del pago
   * 
   * @param {string|number} id - ID del pago a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async ejecutar(id) {
    return await this.pagoAporteRepository.eliminar(id);
  }
}
