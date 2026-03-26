/**
 * Orquesta la descarga del Excel de lista de inscritos por carrera desde la API.
 */
export class ExportarListaInscritosPorCarreraExcelUseCase {
  /**
   * @param {import('@repositories/IEstudianteRepository').IEstudianteRepository} estudianteRepository
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * @param {Object} options
   * @param {string|number} options.carreraId
   * @param {string|number} [options.gestionId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async ejecutar(options = {}) {
    return this.estudianteRepository.descargarListaInscritosPorCarreraExcel(options);
  }
}

