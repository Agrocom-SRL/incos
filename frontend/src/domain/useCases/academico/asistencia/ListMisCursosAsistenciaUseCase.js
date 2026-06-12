/**
 * Cursos del docente (Mis cursos de Asistencia) — gestión vigente.
 * Sin docenteId: docente logueado. Con docenteId: vista coordinación.
 */
export class ListMisCursosAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(options = {}) {
    const { docenteId } = options;
    if (docenteId != null) {
      return this.asistenciaRepository.listarCursosDocenteCoordinacion(docenteId);
    }
    return this.asistenciaRepository.listarMisCursos();
  }
}
