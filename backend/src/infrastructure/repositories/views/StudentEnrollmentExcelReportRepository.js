import { sequelize } from '../../database/sequelize.js';
import { IStudentEnrollmentExcelReportRepository } from '../../../domain/interfaces/repositories/IStudentEnrollmentExcelReportRepository.js';

/**
 * Consultas para el reporte Excel de estadísticas de inscritos (vista SQL).
 * Repositorio de SOLO LECTURA para reportes (arquetipo views/).
 */
export class StudentEnrollmentExcelReportRepository extends IStudentEnrollmentExcelReportRepository {
  /**
   * Filas de vista_reporte_excel_inscritos para una gestión.
   *
   * @param {number} gestionId - ID de gestiones.id
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findRowsByGestionId(gestionId) {
    const query = `
      SELECT *
      FROM vista_reporte_excel_inscritos
      WHERE gestion_id = :gestionId
      ORDER BY carrera_nombre, periodo_numero, paralelo_nombre
    `;

    return sequelize.query(query, {
      replacements: { gestionId },
      type: sequelize.QueryTypes.SELECT
    });
  }
}
