import { sequelize } from '../database/sequelize.js';

/**
 * Consultas para el reporte Excel de lista de inscritos (vista SQL).
 */
export class StudentEnrollmentStudentListExcelReportRepository {
  /**
   * Filas de vista_reporte_excel_lista_inscritos para una gestión y carrera.
   *
   * @param {number} gestionId - ID de gestiones.id
   * @param {number} carreraId - ID de carreras.id
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findRowsByGestionIdAndCarreraId(gestionId, carreraId) {
    const query = `
      SELECT *
      FROM vista_reporte_excel_lista_inscritos
      WHERE gestion_id = :gestionId
        AND carrera_id = :carreraId
      ORDER BY periodo_numero, paralelo_nombre, apellido_paterno, apellido_materno, nombres
    `;

    return sequelize.query(query, {
      replacements: { gestionId, carreraId },
      type: sequelize.QueryTypes.SELECT
    });
  }
}
