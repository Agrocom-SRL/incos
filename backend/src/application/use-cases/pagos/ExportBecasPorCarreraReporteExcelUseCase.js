/**
 * Exporta la Planilla de Control de Becas por carrera a Excel (.xlsx, una hoja).
 *
 * Reutiliza GetBecasPorCarreraReporteUseCase para obtener EXACTAMENTE los mismos
 * datos que ve la pantalla (paridad pantalla↔Excel) y delega el armado del libro
 * en la interfaz IBecasReporteExcelGenerator (inyectada por el container).
 */
export class ExportBecasPorCarreraReporteExcelUseCase {
  /**
   * @param {Object} params
   * @param {import('./GetBecasPorCarreraReporteUseCase.js').GetBecasPorCarreraReporteUseCase} params.getBecasPorCarreraReporteUseCase
   * @param {import('../../../domain/interfaces/services/IBecasReporteExcelGenerator.js').IBecasReporteExcelGenerator} params.becasReporteExcelGenerator
   * @param {Object} params.logger
   */
  constructor({ getBecasPorCarreraReporteUseCase, becasReporteExcelGenerator, logger }) {
    this.getBecasPorCarreraReporteUseCase = getBecasPorCarreraReporteUseCase;
    this.becasReporteExcelGenerator = becasReporteExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number|null|undefined} [params.gestionId]
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ gestionId } = {}) {
    const reporte = await this.getBecasPorCarreraReporteUseCase.execute({ gestionId });

    const datos = { ...reporte, fechaEmision: this._today() };
    const buffer = await this.becasReporteExcelGenerator.generarPlanillaBecasPorCarrera(datos);

    const safeYear = String(reporte?.gestion?.anio ?? reporte?.gestion?.id ?? 'gestion').replace(
      /[^\dA-Za-z._-]/g,
      '_'
    );
    const fileName = `planilla_becas_por_carrera_${safeYear}.xlsx`;

    this.logger?.info?.('[Pagos] Excel planilla becas por carrera generado', {
      gestionId: reporte?.gestion?.id ?? gestionId ?? null,
      carreras: reporte?.filas?.length ?? 0,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /** Fecha de emisión = hoy del servidor (YYYY-MM-DD). @private */
  _today() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export default ExportBecasPorCarreraReporteExcelUseCase;
