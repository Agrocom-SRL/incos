/**
 * Buscar estudiantes para registro de aporte (API pagos-aportes/buscar-estudiantes-registro).
 */

import { IPagoAporteRepository } from '@repositories/IPagoAporteRepository';

export class BuscarEstudiantesRegistroAporteUseCase {
  /**
   * @param {IPagoAporteRepository} pagoAporteRepository
   */
  constructor(pagoAporteRepository) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * @param {Object} options
   * @param {string} [options.q]
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar]
   */
  async ejecutar(options = {}) {
    const { q = '', limit, preliminar } = options;
    return this.pagoAporteRepository.buscarEstudiantesRegistroAporte({ q, limit, preliminar });
  }
}
