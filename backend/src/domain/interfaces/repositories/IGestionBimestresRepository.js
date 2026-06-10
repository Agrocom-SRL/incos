/**
 * Interfaz de Repositorio (comando + consulta): IGestionBimestresRepository
 *
 * Contrato del repositorio de gestión institucional de bimestres (estado,
 * métricas, iniciar gestión académica, activar cursado, cerrar bimestre).
 *
 * NO extiende IRepository: no es un CRUD por id sobre una tabla, sino un
 * repositorio transaccional de dominio (lecturas de vista + mutaciones
 * acopladas en una misma operación de negocio). Declara sus métodos públicos.
 */
export class IGestionBimestresRepository {
  /**
   * ¿La gestión académica ya fue iniciada (hay matrículas en cursado)?
   * @param {number} gestionId
   * @returns {Promise<boolean>}
   */
  async gestionAcademicaIniciada(gestionId) {
    throw new Error('Method gestionAcademicaIniciada() must be implemented');
  }

  /**
   * Estados institucionales por bimestre de una gestión.
   * @param {number} gestionId
   * @returns {Promise<Map<number, string>>}
   */
  async estadosInstitucionalesBimestres(gestionId) {
    throw new Error('Method estadosInstitucionalesBimestres() must be implemented');
  }

  /**
   * Métricas agregadas de los bimestres de una gestión.
   * @param {number} gestionId
   * @returns {Promise<Object>}
   */
  async obtenerMetricasGestionBimestres(gestionId) {
    throw new Error('Method obtenerMetricasGestionBimestres() must be implemented');
  }

  /**
   * Inicia la gestión académica vigente (INSCRITO→CURSANDO + apertura de bimestres).
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async iniciarGestionAcademica(userId) {
    throw new Error('Method iniciarGestionAcademica() must be implemented');
  }

  /**
   * Activa el cursado de todas las matrículas de una inscripción (transaccional).
   * @param {number} inscripcionId
   * @param {number|null} [userId]
   * @returns {Promise<Object>}
   */
  async activarCursadoPorInscripcion(inscripcionId, userId) {
    throw new Error('Method activarCursadoPorInscripcion() must be implemented');
  }

  /**
   * Valida si un bimestre puede cerrarse.
   * @param {number} numeroBimestre
   * @param {number} gestionId
   * @returns {Promise<Object>}
   */
  async validarCierreBimestre(numeroBimestre, gestionId) {
    throw new Error('Method validarCierreBimestre() must be implemented');
  }

  /**
   * Cierra un bimestre de la gestión vigente.
   * @param {number} numeroBimestre
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async cerrarBimestreGestion(numeroBimestre, userId) {
    throw new Error('Method cerrarBimestreGestion() must be implemented');
  }

  /**
   * Payload completo de gestión-bimestres de la gestión vigente.
   * @returns {Promise<Object|null>}
   */
  async obtenerGestionBimestres() {
    throw new Error('Method obtenerGestionBimestres() must be implemented');
  }
}
