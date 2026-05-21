/**
 * Cursos del docente (Mis cursos) — gestión vigente.
 */

export class ListMisCursosUseCase {
  /**
   * @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository
   */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  /**
   * @param {Object} [options]
   * @param {number|string} [options.docenteId] — vista coordinación
   */
  async ejecutar(options = {}) {
    const { docenteId } = options;
    if (docenteId != null) {
      return this.calificacionRepository.listarCursosDocenteCoordinacion(docenteId);
    }
    return this.calificacionRepository.listarMisCursos();
  }
}
