/**
 * Exporta la Planilla de Control de Cuentas por Cobrar a Excel (.xlsx, una hoja).
 *
 * Reutiliza GetCuentasPorCobrarReporteUseCase para obtener EXACTAMENTE los mismos
 * datos que ve la pantalla (paridad pantalla↔Excel) y delega el armado del libro
 * en la interfaz ICuentasPorCobrarReporteExcelGenerator (inyectada por el container).
 */
export class ExportCuentasPorCobrarReporteExcelUseCase {
  /**
   * @param {Object} params
   * @param {import('./GetCuentasPorCobrarReporteUseCase.js').GetCuentasPorCobrarReporteUseCase} params.getCuentasPorCobrarReporteUseCase
   * @param {import('../../../domain/interfaces/services/ICuentasPorCobrarReporteExcelGenerator.js').ICuentasPorCobrarReporteExcelGenerator} params.cuentasPorCobrarReporteExcelGenerator
   * @param {Object} params.logger
   */
  constructor({
    getCuentasPorCobrarReporteUseCase,
    cuentasPorCobrarReporteExcelGenerator,
    logger,
  }) {
    this.getCuentasPorCobrarReporteUseCase = getCuentasPorCobrarReporteUseCase;
    this.cuentasPorCobrarReporteExcelGenerator = cuentasPorCobrarReporteExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number|null|undefined} [params.gestionId]
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ gestionId } = {}) {
    const reporte = await this.getCuentasPorCobrarReporteUseCase.execute({ gestionId });

    const datos = { ...reporte, fechaEmision: this._today() };
    const buffer =
      await this.cuentasPorCobrarReporteExcelGenerator.generarPlanillaCuentasPorCobrar(datos);

    const safeYear = String(reporte?.gestion?.anio ?? reporte?.gestion?.id ?? 'gestion').replace(
      /[^\dA-Za-z._-]/g,
      '_'
    );
    const fileName = `cuentas_por_cobrar_${safeYear}.xlsx`;

    this.logger?.info?.('[Pagos] Excel planilla cuentas por cobrar generado', {
      gestionId: reporte?.gestion?.id ?? gestionId ?? null,
      carreras: reporte?.carreras?.length ?? 0,
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

export default ExportCuentasPorCobrarReporteExcelUseCase;
