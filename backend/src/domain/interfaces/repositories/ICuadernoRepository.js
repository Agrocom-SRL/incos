/**
 * Interfaz de Repositorio (solo lectura): ICuadernoRepository
 *
 * Lecturas del cuaderno bimestral (evaluaciones, notas cargadas, filas de cálculo,
 * estudiantes y resúmenes) desde vistas SQL y la tabla `evaluaciones`.
 *
 * NO extiende IRepository: es un repositorio de LECTURA/coordinación del cuaderno.
 * Las ESCRITURAS se movieron a sus repos de tabla única:
 * - evaluaciones_notas   → IEvaluacionNotaRepository (BimesterEvaluationGradeRepository)
 * - bimestres_matricula  → IBimestreMatriculaRepository (SubjectEnrollmentBimesterRepository)
 * - matriculas_materia   → IMatriculaMateriaRepository (SubjectEnrollmentRepository)
 * y se orquestan en los casos de uso / utils de application.
 */
export class ICuadernoRepository {
  /** @returns {Promise<number|null>} */
  async obtenerPeriodoAcademicoId(gestionId, bimestreNumero) {
    throw new Error('Method obtenerPeriodoAcademicoId() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarEvaluaciones(asignacionId, periodoAcademicoId) {
    throw new Error('Method listarEvaluaciones() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarNotasCuaderno(asignacionId, bimestreNumero) {
    throw new Error('Method listarNotasCuaderno() must be implemented');
  }

  /** @returns {Promise<Object|null>} */
  async obtenerEvaluacionDeAsignacion(evaluacionId, asignacionId) {
    throw new Error('Method obtenerEvaluacionDeAsignacion() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarFilasCalculoBimestre(asignacionId, bimestreNumero) {
    throw new Error('Method listarFilasCalculoBimestre() must be implemented');
  }

  /** Columnas tipo ASISTENCIA del curso en un bimestre (con rango de fechas). @returns {Promise<Array<Object>>} */
  async listarColumnasAsistenciaBimestre(_asignacionId, _gestionId, _bimestreNumero) {
    throw new Error('Method listarColumnasAsistenciaBimestre() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarEstudiantesExportRegistroPedagogico(asignacionId) {
    throw new Error('Method listarEstudiantesExportRegistroPedagogico() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarEstudiantesResumenBimestre(asignacionId, bimestreNumero) {
    throw new Error('Method listarEstudiantesResumenBimestre() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarTodasNotasBimestreCuaderno(asignacionId, bimestreNumero) {
    throw new Error('Method listarTodasNotasBimestreCuaderno() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarResumenNotasPorMatricula(asignacionId) {
    throw new Error('Method listarResumenNotasPorMatricula() must be implemented');
  }
}
