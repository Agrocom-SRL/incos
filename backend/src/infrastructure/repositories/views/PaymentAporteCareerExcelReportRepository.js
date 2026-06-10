import { sequelize } from '../../database/sequelize.js';
import { IPaymentAporteCareerExcelReportRepository } from '../../../domain/interfaces/repositories/IPaymentAporteCareerExcelReportRepository.js';

/**
 * Filas para Excel: estado de aporte por estudiante inscrito (vista SQL).
 * Repositorio de SOLO LECTURA para reportes (arquetipo views/).
 */
export class PaymentAporteCareerExcelReportRepository extends IPaymentAporteCareerExcelReportRepository {
  /**
   * @param {number} gestionId
   * @param {number} carreraId
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findRowsByGestionIdAndCarreraId(gestionId, carreraId) {
    const query = `
      SELECT *
      FROM vista_reporte_excel_lista_aportes_por_carrera
      WHERE gestion_id = :gestionId
        AND carrera_id = :carreraId
      ORDER BY
        periodo_numero,
        paralelo_nombre,
        LOWER(nombre_completo),
        ci
    `;

    return sequelize.query(query, {
      replacements: { gestionId, carreraId },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
