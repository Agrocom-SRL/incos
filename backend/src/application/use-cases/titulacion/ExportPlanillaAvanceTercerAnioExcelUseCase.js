/**
 * Use Case: ExportPlanillaAvanceTercerAnioExcelUseCase
 * Módulo: Titulación (TIT), Requisito 3 — extensión 2026-07-31
 *
 * Excel de la planilla de avance de tutorías "10 en 10": reutiliza
 * `GetPlanillaAvanceTercerAnioUseCase.execute` (no relee la BD dos veces) y
 * delega el pintado al builder (folios apilados + hoja de firmas + cuadro
 * de %).
 */
export class ExportPlanillaAvanceTercerAnioExcelUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getPlanillaAvanceTercerAnioUseCase
   * @param {Object} params.planillaAvanceTutoriaExcelGenerator
   * @param {ILogger} params.logger
   */
  constructor({ getPlanillaAvanceTercerAnioUseCase, planillaAvanceTutoriaExcelGenerator, logger }) {
    this.getPlanillaAvanceTercerAnioUseCase = getPlanillaAvanceTercerAnioUseCase;
    this.planillaAvanceTutoriaExcelGenerator = planillaAvanceTutoriaExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { carreraId, gestionId, bimestre }
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(queryParams = {}) {
    const { planillaAvanceTercerAnio } = await this.getPlanillaAvanceTercerAnioUseCase.execute(
      queryParams
    );

    const buffer = await this.planillaAvanceTutoriaExcelGenerator.generarPlanillaAvanceTutoria(
      planillaAvanceTercerAnio
    );

    const { cabecera } = planillaAvanceTercerAnio;
    const carreraSlug = (cabecera.carreraNombre || 'carrera')
      .toLowerCase()
      .replace(/\s+/g, '-');

    this.logger.info('[Titulación] Planilla de avance de tutorías exportada (Excel)', {
      carreraId: cabecera.carreraId,
      bimestre: cabecera.bimestre,
    });

    return {
      buffer,
      fileName: `planilla-avance-tutoria-${carreraSlug}-bimestre-${cabecera.bimestre}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
