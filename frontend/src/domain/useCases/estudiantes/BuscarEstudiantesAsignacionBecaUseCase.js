/**
 * Buscar estudiantes para asignar beca (API estudiantes/buscar-asignacion-beca).
 */

export class BuscarEstudiantesAsignacionBecaUseCase {
  /**
   * @param {Object} estudianteRepository - Repositorio HTTP de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * @param {Object} options
   * @param {string} [options.q]
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar]
   */
  async ejecutar(options = {}) {
    const { q = '', limit, preliminar } = options;
    return this.estudianteRepository.buscarAsignacionBeca({ q, limit, preliminar });
  }
}
