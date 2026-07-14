/**
 * Buscar estudiantes para el wizard de Inscripción nueva (API estudiantes/buscar-para-inscripcion).
 * No excluye a los ya matriculados en la gestión vigente: cada fila trae
 * yaMatriculadoGestionActual para que la UI avise y bloquee la selección.
 */

export class BuscarEstudiantesParaInscripcionUseCase {
  /**
   * @param {Object} estudianteRepository - Repositorio HTTP de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * @param {string} terminoBusqueda - Término de búsqueda (texto libre)
   * @param {Object} [options]
   * @param {number} [options.limit]
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(terminoBusqueda, options = {}) {
    const term = String(terminoBusqueda ?? '').trim();
    if (term.length < 2) {
      return { success: true, data: [] };
    }
    return this.estudianteRepository.buscarParaInscripcion({ q: term, limit: options.limit });
  }
}
