/**
 * Registro académico de notas por asignación.
 */

export class ObtenerRegistroNotasCursoUseCase {
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  /**
   * @param {number|string} asignacionId
   */
  async ejecutar(asignacionId) {
    return this.calificacionRepository.obtenerRegistroNotas(asignacionId);
  }
}
