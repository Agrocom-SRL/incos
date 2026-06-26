/**
 * Interfaz de Repositorio (solo lectura): ICalificacionContextoRepository
 *
 * Contrato del repositorio que lee el contexto académico vigente y los periodos
 * bimestre desde vistas SQL (vista_calificacion_contexto_vigente (103),
 * vista_base_calificacion_periodos_bimestre (105)).
 *
 * NO extiende IRepository: es un repositorio de SOLO LECTURA sobre vistas, no
 * un CRUD de entidad. Declara únicamente sus métodos de consulta. Devuelve filas
 * de la vista (DTO plano), no entidades de dominio.
 */
export class ICalificacionContextoRepository {
  /**
   * Contexto de la gestión vigente (gestión + bimestre vigente).
   * @returns {Promise<Object|null>}
   */
  async obtenerContextoVigente() {
    throw new Error('Method obtenerContextoVigente() must be implemented');
  }

  /**
   * Periodos bimestre de una gestión (estado de calendario por bimestre).
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async obtenerPeriodosBimestresGestion(gestionId) {
    throw new Error('Method obtenerPeriodosBimestresGestion() must be implemented');
  }

  /**
   * Gestión inmediatamente anterior por año (para arrastre/comparación).
   * @param {number} gestionAnio
   * @returns {Promise<Object|null>}
   */
  async obtenerGestionAnteriorPorAnio(gestionAnio) {
    throw new Error('Method obtenerGestionAnteriorPorAnio() must be implemented');
  }

  /**
   * Estado institucional agregado del bimestre en una gestión (vista 114):
   * 'PENDIENTE' | 'EN_CURSO' | 'CERRADO', o null si no hay filas.
   * @param {number} gestionId
   * @param {number} bimestreNumero 1-4
   * @returns {Promise<string|null>}
   */
  async obtenerEstadoInstitucionalBimestre(_gestionId, _bimestreNumero) {
    throw new Error('Method obtenerEstadoInstitucionalBimestre() must be implemented');
  }
}
