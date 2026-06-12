/**
 * Listado de docentes para coordinación de Asistencia (elegir docente).
 */
export class ListCoordinacionAsistenciaDocentesUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(options = {}) {
    const { q = '', limit, preliminar } = options;
    return this.asistenciaRepository.listarCoordinacionDocentes({ q, limit, preliminar });
  }
}
