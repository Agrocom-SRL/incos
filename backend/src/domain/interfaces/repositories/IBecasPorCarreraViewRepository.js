/**
 * Interfaz de Repositorio (solo lectura): IBecasPorCarreraViewRepository
 *
 * Filas crudas (1 por estudiante matriculado por carrera/gestión) para la
 * planilla de control de becas por carrera, desde la vista SQL existente
 * `vista_base_reporte_excel_lista_aportes_por_carrera_filas` (vista 89).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA para reportes
 * (arquetipo B / `views/`).
 */
export class IBecasPorCarreraViewRepository {
  /**
   * Devuelve filas crudas por gestión:
   * carrera_id, carrera_nombre, carrera_codigo, estudiante_id,
   * beca_porcentaje (0 si no aplica), beca_tipo_nombre ('NO APLICA' si no hay beca).
   *
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findRowsByGestionId(_gestionId) {
    throw new Error('Method findRowsByGestionId() must be implemented');
  }
}
