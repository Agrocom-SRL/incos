/**
 * Interfaz de Repositorio (comando + consulta): IGestionBimestresRepository
 *
 * Contrato del repositorio de gestión institucional de bimestres (estado,
 * métricas, validación y cierre de bimestre).
 *
 * NO extiende IRepository: es un repositorio de LECTURA (vistas) + coordinación.
 * Las escrituras de transición (matriculas_materia / bimestres_matricula) NO
 * viven aquí: se orquestan en los casos de uso sobre repos de tabla única.
 * Declara sus métodos públicos.
 */
export class IGestionBimestresRepository {
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
