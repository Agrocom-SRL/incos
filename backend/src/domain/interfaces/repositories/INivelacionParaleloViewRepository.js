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
}

export default INivelacionParaleloViewRepository;
