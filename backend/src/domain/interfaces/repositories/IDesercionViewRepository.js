/**
 * Interfaz de Repositorio (SOLO LECTURA): IDesercionViewRepository.
 *
 * Lee la métrica institucional de deserción (grano ANUAL por estados
 * ABANDONO/RETIRADO de matriculas_materia):
 *   - agregado carrera × gestión desde `vista_desercion_carrera_gestion` (173),
 *   - detalle de desertores desde `vista_base_desercion_matricula_fila` (172).
 *
 * NO extiende IRepository: arquetipo B (lectura sobre 03-views/).
 */
export class IDesercionViewRepository {
  /**
   * Agregado por carrera × gestión (denominadores incluidos).
   * @param {{ gestionId?: (number|null), carreraId?: (number|null) }} _params
   * @returns {Promise<Array<Object>>}
   */
  async listarResumenCarreraGestion(_params) {
    throw new Error('Method listarResumenCarreraGestion() must be implemented');
  }

  /**
   * Filas de desertores (es_desercion = 1), una por matrícula de materia.
   * @param {{ gestionId?: (number|null), carreraId?: (number|null) }} _params
   * @returns {Promise<Array<Object>>}
   */
  async listarDesertores(_params) {
    throw new Error('Method listarDesertores() must be implemented');
  }
}
