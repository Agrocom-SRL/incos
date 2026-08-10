/**
 * Use Case: ExportSeguimientoTutoriaDocentesExcelUseCase
 * Módulo: Titulación (TIT) — extensión 2026-08-10
 *
 * Excel del reporte de seguimiento de tutorías a docentes: reutiliza
 * `GetSeguimientoTutoriaDocentesPorCarreraUseCase.execute` (no relee la BD
 * dos veces) y delega el pintado al builder — resumen de UN MES (como el
 * tablero en pantalla), una hoja POR CARRERA con sus docentes-tutores en
 * tabla plana (mismo criterio del documento físico real, título en plural
 * "...A DOCENTES").
 */
export class ExportSeguimientoTutoriaDocentesExcelUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getSeguimientoTutoriaDocentesPorCarreraUseCase
   * @param {Object} params.seguimientoTutoriaDocentesExcelGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getSeguimientoTutoriaDocentesPorCarreraUseCase,
    seguimientoTutoriaDocentesExcelGenerator,
    logger,
  }) {
    this.getSeguimientoTutoriaDocentesPorCarreraUseCase = getSeguimientoTutoriaDocentesPorCarreraUseCase;
    this.seguimientoTutoriaDocentesExcelGenerator = seguimientoTutoriaDocentesExcelGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { docenteId, carreraId, anio, mes }
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(queryParams = {}) {
    const { seguimientoTutoriaDocentesPorCarrera } =
      await this.getSeguimientoTutoriaDocentesPorCarreraUseCase.execute(queryParams);

    const buffer =
      await this.seguimientoTutoriaDocentesExcelGenerator.generarSeguimientoTutoriaDocentes(
        seguimientoTutoriaDocentesPorCarrera
      );

    const { anio, mes, carreras } = seguimientoTutoriaDocentesPorCarrera;

    this.logger.info('[Titulación] Seguimiento de tutorías a docentes exportado (Excel)', {
      anio,
      mes,
      carreras: carreras.length,
    });

    return {
      buffer,
      fileName: `seguimiento-tutoria-docentes-${anio}-${String(mes).padStart(2, '0')}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
