/**
 * Interfaz de Repositorio (solo lectura): IProyectoGradoListadoViewRepository
 *
 * Lecturas del listado y ficha de proyectos de grado (módulo TUT · titulación)
 * desde las vistas SQL:
 * - `vista_tutoria_proyectos_listado` (160): 1 fila por proyecto con agregados
 *   de seguimiento (integrantes, bitácora, avances pendientes).
 * - `vista_base_tutoria_proyecto_integrante_fila` (159): 1 fila por integrante.
 * - `vista_base_tutoria_bitacora_mensual_tutor` (163): reporte mensual DDE.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IProyectoGradoListadoViewRepository {
  /**
   * Listado paginado de proyectos desde la vista 160.
   *
   * @param {Object} filters
   *   - search: texto sobre titulo/tutor_nombre
   *   - gestionId, carreraId, modalidadId, estado, tutorId
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findListado(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findListado() must be implemented');
  }

  /**
   * Fila de UN proyecto desde la vista 160, o null.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Object|null>}
   */
  async findListadoById(_proyectoGradoId) {
    throw new Error('Method findListadoById() must be implemented');
  }

  /**
   * Integrantes del proyecto desde la vista 159 (TITULAR primero).
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findIntegrantesByProyectoId(_proyectoGradoId) {
    throw new Error('Method findIntegrantesByProyectoId() must be implemented');
  }

  /**
   * Filas de la vista 159 donde el estudiante es integrante ACTIVO
   * (resuelve "mi proyecto" del portal del estudiante).
   *
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  async findIntegranteRowsByEstudianteId(_estudianteId) {
    throw new Error('Method findIntegranteRowsByEstudianteId() must be implemented');
  }

  /**
   * Reporte mensual de bitácora por tutor desde la vista 163.
   *
   * @param {Object} params - { mes: 'YYYY-MM', gestionId, tutorId }
   * @returns {Promise<Array<Object>>}
   */
  async findBitacoraMensual(_params = {}) {
    throw new Error('Method findBitacoraMensual() must be implemented');
  }
}
