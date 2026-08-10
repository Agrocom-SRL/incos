/**
 * Use Case: ExportSeguimientoTutoriaDocentesExcelUseCase
 * Módulo: Titulación (TIT) — extensión 2026-08-10
 *
 * Excel del reporte de seguimiento de tutorías a docentes: reutiliza
 * `GetSeguimientoTutoriaDocentesUseCase.execute` (no relee la BD dos veces)
 * y delega el pintado al builder (una hoja POR DOCENTE, mismo criterio del
 * documento físico real).
 */
export class ExportSeguimientoTutoriaDocentesExcelUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getSeguimientoTutoriaDocentesUseCase
   * @param {Object} params.seguimientoTutoriaDocentesExcelGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getSeguimientoTutoriaDocentesUseCase,
    seguimientoTutoriaDocentesExcelGenerator,
    logger,
  }) {
    this.getSeguimientoTutoriaDocentesUseCase = getSeguimientoTutoriaDocentesUseCase;
    this.seguimientoTutoriaDocentesExcelGenerator = seguimientoTutoriaDocentesExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { docenteId, carreraId, anio, mes }
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(queryParams = {}) {
    const { seguimientoTutoriaDocentes } = await this.getSeguimientoTutoriaDocentesUseCase.execute(
      queryParams
    );

    const buffer =
      await this.seguimientoTutoriaDocentesExcelGenerator.generarSeguimientoTutoriaDocentes(
        seguimientoTutoriaDocentes
      );

    const { anio, mes } = seguimientoTutoriaDocentes;

    this.logger.info('[Titulación] Seguimiento de tutorías a docentes exportado (Excel)', {
      anio,
      mes,
      docentes: seguimientoTutoriaDocentes.docentes.length,
    });

    return {
      buffer,
      fileName: `seguimiento-tutoria-docentes-${anio}-${String(mes).padStart(2, '0')}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
