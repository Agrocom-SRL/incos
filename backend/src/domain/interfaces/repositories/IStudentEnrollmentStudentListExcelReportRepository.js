/**
 * Interfaz de Repositorio (solo lectura): IStudentEnrollmentStudentListExcelReportRepository
 *
 * Filas para el reporte Excel de lista de inscritos, desde vista SQL.
 * NO extiende IRepository: repositorio de SOLO LECTURA para reportes.
 */
export class IStudentEnrollmentStudentListExcelReportRepository {
  /**
   * @param {number} gestionId
   * @param {number} carreraId
   * @returns {Promise<Array<Object>>}
   */
  async findRowsByGestionIdAndCarreraId(gestionId, carreraId) {
    throw new Error('Method findRowsByGestionIdAndCarreraId() must be implemented');
  }
}
