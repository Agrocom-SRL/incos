/**
 * Buscar estudiantes para el wizard de Inscripción nueva (API estudiantes/buscar-para-inscripcion).
 * No excluye a los ya matriculados en la gestión vigente: cada fila trae
 * yaMatriculadoGestionActual para que la UI avise y bloquee la selección.
 *
 * Modo sugerencias (`options.soloNuevos`): sin término ni mínimo de caracteres,
 * pide `solo_nuevos=1` — estudiantes con 0 inscripciones en el sistema
 * (limit por defecto 10 en el backend), para el estado inicial del paso Buscar.
 */

export class BuscarEstudiantesParaInscripcionUseCase {
  /**
   * @param {Object} estudianteRepository - Repositorio HTTP de estudiantes
   */
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  /**
   * @param {string} terminoBusqueda - Término de búsqueda (texto libre; ignorado con soloNuevos)
   * @param {Object} [options]
   * @param {number} [options.limit]
   * @param {boolean} [options.soloNuevos] - Solo estudiantes sin ninguna inscripción en el sistema
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async ejecutar(terminoBusqueda, options = {}) {
    if (options.soloNuevos) {
      return this.estudianteRepository.buscarParaInscripcion({
        soloNuevos: true,
        limit: options.limit,
      });
    }

    const term = String(terminoBusqueda ?? '').trim();
    if (term.length < 2) {
      return { success: true, data: [] };
    }
    return this.estudianteRepository.buscarParaInscripcion({ q: term, limit: options.limit });
  }
}
