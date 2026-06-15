/**
 * Interfaz de Repositorio (solo lectura): ICalificacionCoordinacionRepository
 *
 * Contrato del repositorio que lee coordinación de calificaciones y cursos por
 * docente desde vistas SQL (104, 106, 107, 108, 109).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vistas, no CRUD.
 * Devuelve filas de la vista (DTO plano), no entidades de dominio.
 */
export class ICalificacionCoordinacionRepository {
  /**
   * Docentes con resumen de coordinación (preliminar o búsqueda).
   * @param {Object} options
   * @returns {Promise<Array<Object>>}
   */
  async listarDocentesCoordinacion(options = {}) {
    throw new Error('Method listarDocentesCoordinacion() must be implemented');
  }

  /**
   * Encabezado de calificaciones de un docente.
   * @param {number} docenteId
   * @returns {Promise<Object|null>}
   */
  async obtenerDocenteCalificaciones(docenteId) {
    throw new Error('Method obtenerDocenteCalificaciones() must be implemented');
  }

  /**
   * Cursos asignados a un docente.
   * @param {number} docenteId
   * @returns {Promise<Array<Object>>}
   */
  async listarCursosPorDocente(docenteId) {
    throw new Error('Method listarCursosPorDocente() must be implemented');
  }

  /**
   * Resumen por bimestre de los cursos de un docente.
   * @param {number} docenteId
   * @param {number} [notaMinimaAprobacion]
   * @returns {Promise<Array<Object>>}
   */
  async listarResumenBimestresCursosPorDocente(docenteId, notaMinimaAprobacion) {
    throw new Error('Method listarResumenBimestresCursosPorDocente() must be implemented');
  }

  /**
   * Curso por id de asignación docente.
   * @param {number} asignacionId
   * @returns {Promise<Object|null>}
   */
  async obtenerCursoPorAsignacion(asignacionId) {
    throw new Error('Method obtenerCursoPorAsignacion() must be implemented');
  }

  /**
   * Estudiantes con sus notas para el registro de notas del curso.
   * @param {number} asignacionId
   * @returns {Promise<Array<Object>>}
   */
  async listarEstudiantesRegistroNotas(asignacionId) {
    throw new Error('Method listarEstudiantesRegistroNotas() must be implemented');
  }
}
