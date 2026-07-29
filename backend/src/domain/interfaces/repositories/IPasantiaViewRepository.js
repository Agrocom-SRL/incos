/**
 * Interfaz de Repositorio (solo lectura): IPasantiaViewRepository
 *
 * Lecturas del listado y ficha de pasantías (módulo TUT · pasantías) desde
 * las vistas SQL:
 * - `vista_pasantias_listado` (167): 1 fila por pasantía vigente con
 *   identidad resuelta (estudiante, empresa, carrera, gestión, supervisor).
 * - `vista_pasantia_detalle` (168): la misma fila con los campos de ficha
 *   (puesto, contrato, contacto de la empresa) + agregados de satélites
 *   (total_informes, total_seguimientos, último seguimiento).
 *
 * Los wrappers self NO son vistas aparte: "mis pasantías" del docente es
 * WHERE docente_supervisor_id = ? y "mi pasantía" del estudiante es
 * WHERE estudiante_id = ? sobre la vista 167.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class IPasantiaViewRepository {
  /**
   * Listado paginado de pasantías desde la vista 167.
   *
   * @param {Object} filters
   *   - search: texto sobre estudiante_nombre/empresa_nombre/docente_supervisor_nombre
   *   - carreraId, gestionId, estado, tipo, docenteSupervisorId, estudianteId
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>} Filas crudas snake_case
   */
  async findListado(_filters = {}, _page = 1, _limit = 50) {
    throw new Error('Method findListado() must be implemented');
  }

  /**
   * Fila de UNA pasantía desde la vista 168 (detalle), o null.
   *
   * @param {number} pasantiaId
   * @returns {Promise<Object|null>}
   */
  async findListadoById(_pasantiaId) {
    throw new Error('Method findListadoById() must be implemented');
  }
}
