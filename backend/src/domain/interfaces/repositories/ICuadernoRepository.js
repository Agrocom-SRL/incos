/**
 * Interfaz de Repositorio (comando + consulta): ICuadernoRepository
 *
 * Contrato del repositorio del cuaderno bimestral (evaluaciones, notas
 * cargadas, habilitaciones, cálculo de componentes y nota final).
 *
 * NO extiende IRepository: no es un CRUD por id sobre una tabla, sino un
 * repositorio transaccional de dominio que combina lecturas de vista con
 * upserts/soft-deletes acoplados a la lógica del cuaderno. Declara sus métodos
 * públicos.
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

  /** @returns {Promise<number|null>} */
  async obtenerBimestreMatriculaId(asignacionId, estudianteId, bimestreNum) {
    throw new Error('Method obtenerBimestreMatriculaId() must be implemented');
  }

  /** @returns {Promise<number|null>} */
  async asegurarBimestreMatriculaId(asignacionId, estudianteId, bimestreNum, usuarioId) {
    throw new Error('Method asegurarBimestreMatriculaId() must be implemented');
  }

  /** @returns {Promise<void>} */
  async asegurarBimestresMatriculaCurso(asignacionId, bimestreVigenteNum, usuarioId) {
    throw new Error('Method asegurarBimestresMatriculaCurso() must be implemented');
  }

  /** @returns {Promise<Object|null>} */
  async buscarNotaCelda(evaluacionId, bimestreMatriculaId) {
    throw new Error('Method buscarNotaCelda() must be implemented');
  }

  /** @returns {Promise<{id:number, nota:number}>} */
  async upsertNotaCelda(params) {
    throw new Error('Method upsertNotaCelda() must be implemented');
  }

  /** @returns {Promise<void>} */
  async eliminarNotaCelda(evaluacionId, bimestreMatriculaId, usuarioId) {
    throw new Error('Method eliminarNotaCelda() must be implemented');
  }

  /** @returns {Promise<void>} */
  async softEliminarNotasPorEvaluacion(evaluacionId, usuarioId) {
    throw new Error('Method softEliminarNotasPorEvaluacion() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarFilasCalculoBimestre(asignacionId, bimestreNumero) {
    throw new Error('Method listarFilasCalculoBimestre() must be implemented');
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

  /** @returns {Promise<number[]>} */
  async listarBimestresMatriculaIdsCurso(asignacionId, bimestreNumero) {
    throw new Error('Method listarBimestresMatriculaIdsCurso() must be implemented');
  }

  /** @returns {Promise<void>} */
  async actualizarComponentesBimestreMatricula(bimestreMatriculaId, componentes, usuarioId) {
    throw new Error('Method actualizarComponentesBimestreMatricula() must be implemented');
  }

  /** @returns {Promise<Object|null>} */
  async obtenerBimestreMatriculaPorId(bimestreMatriculaId) {
    throw new Error('Method obtenerBimestreMatriculaPorId() must be implemented');
  }

  /** @returns {Promise<void>} */
  async actualizarHabilitacionBimestreMatricula(bimestreMatriculaId, datos, usuarioId) {
    throw new Error('Method actualizarHabilitacionBimestreMatricula() must be implemented');
  }

  /** @returns {Promise<Array<Object>>} */
  async listarResumenNotasPorMatricula(asignacionId) {
    throw new Error('Method listarResumenNotasPorMatricula() must be implemented');
  }

  /** @returns {Promise<void>} */
  async actualizarNotaFinalMatricula(matriculaMateriaId, notaFinal, usuarioId) {
    throw new Error('Method actualizarNotaFinalMatricula() must be implemented');
  }
}
