/**
 * Orquesta la descarga del Excel de estadística de inscritos desde la API.
 */

export class ExportarEstadisticaInscritosExcelUseCase {
  /**
   * @param {import('@repositories/IEstudianteRepository').IEstudianteRepository} estudianteRepository
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * @param {Object} [options]
   * @param {string|number} [options.gestionId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async ejecutar(options = {}) {
    return this.estudianteRepository.descargarEstadisticaInscritosExcel(options);
  }
}
