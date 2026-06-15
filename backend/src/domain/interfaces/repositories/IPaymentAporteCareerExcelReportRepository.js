/**
 * Interfaz de Repositorio (solo lectura): IPaymentAporteCareerExcelReportRepository
 *
 * Filas para el reporte Excel de estado de aporte por carrera, desde vista SQL.
 * NO extiende IRepository: repositorio de SOLO LECTURA para reportes.
 */
export class IPaymentAporteCareerExcelReportRepository {
  /**
   * @param {number} gestionId
   * @param {number} carreraId
   * @returns {Promise<Array<Object>>}
   */
  async findRowsByGestionIdAndCarreraId(gestionId, carreraId) {
    throw new Error('Method findRowsByGestionIdAndCarreraId() must be implemented');
  }
}
