/**
 * Descarga Excel de estado de aporte por carrera (inscritos + pagos).
 */
export class ExportarListaAportesPorCarreraExcelUseCase {
  /**
   * @param {import('@repositories/IPagoAporteRepository').IPagoAporteRepository} pagoAporteRepository
   */
  constructor(pagoAporteRepository) {
    this.pagoAporteRepository = pagoAporteRepository;
  }

  /**
   * @param {Object} options
   * @param {string|number} options.carreraId
   * @param {string|number} [options.gestionId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async ejecutar(options = {}) {
    return this.pagoAporteRepository.descargarListaAportesPorCarreraExcel(options);
  }
}
