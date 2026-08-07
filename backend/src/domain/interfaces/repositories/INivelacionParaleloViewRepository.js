/**
 * Interfaz de Repositorio (solo lectura): INivelacionParaleloViewRepository
 *
 * Contrato del repositorio que lee los eventos de historial_matricula (+
 * nivelación vinculada) de un paralelo en gestión, desde la vista base 185
 * (vista_base_nivelacion_paralelo_fila).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vistas, no CRUD.
 * Devuelve filas de la vista (DTO plano); el use case arma el contrato final.
 */
export class INivelacionParaleloViewRepository {
  /**
   * Eventos de historial de un paralelo en gestión.
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarEventosPorParaleloGestion(paraleloGestionId) {
    throw new Error('Method listarEventosPorParaleloGestion() must be implemented');
  }

  /**
   * Conteo de estudiantes con algún evento de historial vigente, agrupado
   * por paralelo (todos los paralelos con asignación vigente/activa — mismo
   * universo que la vista 135). Para el selector P1 nivel 1 ("N pendientes
   * de nivelación").
   * @returns {Promise<Array<{paralelo_gestion_id, total_estudiantes, total_pendientes}>>}
   */
  async contarPendientesPorParalelo() {
    throw new Error('Method contarPendientesPorParalelo() must be implemented');
  }

  /**
   * Bandeja plana de nivelaciones PROGRAMADA/EN_CURSO, cruzando todos los
   * paralelos (vista 187). Para `/academico/nivelaciones/aprobar` (B3).
   * @returns {Promise<Array<Object>>}
   */
  async listarNivelacionesPendientes() {
    throw new Error('Method listarNivelacionesPendientes() must be implemented');
  }
}

export default INivelacionParaleloViewRepository;
