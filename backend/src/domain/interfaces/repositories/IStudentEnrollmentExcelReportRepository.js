/**
 * Interfaz de Repositorio (solo lectura): IStudentEnrollmentExcelReportRepository
 *
 * Filas para el reporte Excel de estadísticas de inscritos, desde vista SQL.
 * NO extiende IRepository: repositorio de SOLO LECTURA para reportes.
 */
export class IStudentEnrollmentExcelReportRepository {
  /**
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findRowsByGestionId(gestionId) {
    throw new Error('Method findRowsByGestionId() must be implemented');
  }
}
